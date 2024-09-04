from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, as_completed, wait
from typing import Optional
from langevals_core.base_evaluator import (
    BaseEvaluator,
    BatchEvaluationResult,
    EvaluationResult,
    EvaluatorEntry,
)
import pandas as pd
from pydantic import BaseModel

from langevals.utils import get_evaluator_definitions


class GenericEvaluatorEntry(EvaluatorEntry):
    input: Optional[str] = None
    output: Optional[str] = None
    contexts: Optional[list[str]] = None
    expected_output: Optional[str] = None


class EvaluationResultSet(BaseModel):
    entries: list[EvaluatorEntry]
    evaluators: list[BaseEvaluator]
    results: list[BatchEvaluationResult]

    def to_list(self):
        result = {}
        for i, evaluator in enumerate(self.evaluators):
            evaluator_definitions = get_evaluator_definitions(evaluator)
            result[evaluator_definitions.evaluator_name] = [
                result.model_dump() for result in self.results[i]
            ]

        return result

    def to_pandas(self):
        records = {}
        for entry in self.entries:
            for key in entry.model_dump().keys():
                records[key] = []

        entry_keys = records.keys()
        for i, entry in enumerate(self.entries):
            for key in entry_keys:
                records[key].append(entry.model_dump().get(key, None))

        for i, evaluator in enumerate(self.evaluators):
            evaluator_definitions = get_evaluator_definitions(evaluator)
            for result in self.results[i]:
                result_dict = result.model_dump()
                passed = result_dict.get("passed", None)
                score = result_dict.get("score", None)
                status = result_dict.get("status", None)
                details = result_dict.get("details", result_dict.get("message", None))

                if evaluator_definitions.evaluator_name not in records:
                    records[evaluator_definitions.evaluator_name] = []
                records[evaluator_definitions.evaluator_name].append(
                    status
                    if status != "processed"
                    else passed if passed is not None else score
                )

                details_column = f"{evaluator_definitions.evaluator_name}_details"
                if details is not None and details_column not in records:
                    records[details_column] = [None] * (
                        len(records[evaluator_definitions.evaluator_name]) - 1
                    )
                if details_column in records:
                    records[details_column].append(details)

        df = pd.DataFrame(records)
        df = df.dropna(axis=1, how="all")

        return df


# TODO: docs, and auto-generated docs from evaluators
def evaluate(
    entries: pd.DataFrame,
    evaluators: list[BaseEvaluator],
    max_evaluations_in_parallel: int = 50,
    max_evaluators_in_parallel: int = 5,
) -> EvaluationResultSet:
    entries_ = _pandas_to_generic_entries(entries)
    result_set: list[BatchEvaluationResult] = [[]] * len(evaluators)

    child_executor: Optional[ThreadPoolExecutor] = None

    def set_child_executor(executor: ThreadPoolExecutor):
        nonlocal child_executor
        child_executor = executor

    with ThreadPoolExecutor(max_workers=max_evaluators_in_parallel) as executor:
        future_to_index = {
            executor.submit(
                evaluator.evaluate_batch,
                entries_,
                max_evaluations_in_parallel=max_evaluations_in_parallel,
                _executor_ref=set_child_executor,
            ): idx
            for idx, evaluator in enumerate(evaluators)
        }

        not_done = list(future_to_index.keys())
        try:
            while not_done:
                done, not_done = wait(not_done, timeout=0.1, return_when=FIRST_COMPLETED)
                for future in done:
                    idx = future_to_index[future]
                    result_set[idx] = future.result()
        except KeyboardInterrupt:
            executor.shutdown(wait=False, cancel_futures=True)
            if child_executor is not None:
                child_executor.__setattr__("interrupted", True)
            raise

    return EvaluationResultSet(
        entries=entries_, evaluators=evaluators, results=result_set
    )


def _pandas_to_generic_entries(entries: pd.DataFrame) -> list[EvaluatorEntry]:
    return [GenericEvaluatorEntry(**entry.to_dict()) for _, entry in entries.iterrows()]
