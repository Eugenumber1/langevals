from contextlib import contextmanager
import math
import os
from typing import List, Literal, Optional
import warnings
from langevals_core.base_evaluator import (
    BaseEvaluator,
    EvaluationResult,
    Money,
    EvaluationResultSkipped,
)
from pydantic import BaseModel, Field
from ragas import evaluate
from ragas.metrics.base import Metric
from ragas.llms import LangchainLLMWrapper
from ragas.metrics import (
    answer_relevancy,
    faithfulness,
    context_precision,
    context_recall,
    context_relevancy,
    context_utilization,
)
from langchain_community.callbacks import get_openai_callback
from datasets import Dataset
import litellm
from tqdm import tqdm

from langevals_ragas.lib.model_to_langchain import (
    embeddings_model_to_langchain,
    model_to_langchain,
)

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    from tqdm.notebook import tqdm as tqdm_notebook
from functools import partialmethod

env_vars = []


class RagasSettings(BaseModel):
    model: Literal[
        "openai/gpt-3.5-turbo-1106",
        "openai/gpt-3.5-turbo-0125",
        "openai/gpt-3.5-turbo-16k",
        "openai/gpt-4-1106-preview",
        "openai/gpt-4-0125-preview",
        "azure/gpt-35-turbo-1106",
        "azure/gpt-35-turbo-16k",
        "azure/gpt-4-1106-preview",
        "claude-3-haiku-20240307",
    ] = Field(
        default="azure/gpt-35-turbo-16k",
        description="The model to use for evaluation.",
    )
    embeddings_model: Literal[
        "openai/text-embedding-ada-002",
        "openai/text-embedding-3-small",
        "azure/text-embedding-ada-002",
    ] = Field(
        default="openai/text-embedding-ada-002",
        description="The model to use for embeddings.",
    )
    max_tokens: int = Field(
        default=2048,
        description="The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
    )


class RagasResult(EvaluationResult):
    score: float


def evaluate_ragas(
    evaluator: BaseEvaluator,
    metric: str,
    question: Optional[str] = None,
    answer: Optional[str] = None,
    contexts: Optional[List[str]] = None,
    ground_truth: Optional[str] = None,
    settings: RagasSettings = RagasSettings(),
):
    os.environ["AZURE_API_VERSION"] = "2023-07-01-preview"
    if evaluator.env:
        for key, env in evaluator.env.items():
            os.environ[key] = env

    gpt = model_to_langchain(settings.model)
    gpt_wrapper = LangchainLLMWrapper(langchain_llm=gpt)
    embeddings = embeddings_model_to_langchain(settings.embeddings_model)

    answer_relevancy.llm = gpt_wrapper
    answer_relevancy.embeddings = embeddings  # type: ignore
    faithfulness.llm = gpt_wrapper
    context_precision.llm = gpt_wrapper
    context_recall.llm = gpt_wrapper
    context_relevancy.llm = gpt_wrapper

    contexts = [x for x in contexts if x] if contexts else None

    total_tokens = 0
    total_tokens += len(litellm.encode(model=settings.model, text=question or ""))
    total_tokens += len(litellm.encode(model=settings.model, text=answer or ""))
    if contexts is not None:
        for context in contexts:
            tokens = litellm.encode(model=settings.model, text=context)
            total_tokens += len(tokens)
    max_tokens = min(settings.max_tokens, 16384)
    if total_tokens > max_tokens:
        return EvaluationResultSkipped(
            details=f"Total tokens exceed the maximum of {max_tokens}: {total_tokens}"
        )

    ragas_metric: Metric
    if metric == "answer_relevancy":
        ragas_metric = answer_relevancy
    elif metric == "faithfulness":
        ragas_metric = faithfulness
    elif metric == "context_precision":
        ragas_metric = context_precision
    elif metric == "context_utilization":
        ragas_metric = context_utilization
    elif metric == "context_recall":
        ragas_metric = context_recall
    elif metric == "context_relevancy":
        ragas_metric = context_relevancy
    else:
        raise ValueError(f"Invalid metric: {metric}")

    dataset = Dataset.from_dict(
        {
            "question": [question or ""],
            "answer": [answer or ""],
            "contexts": [contexts or [""]],
            "ground_truth": [ground_truth or ""],
        }
    )

    with get_openai_callback() as cb:
        with disable_tqdm():
            result = evaluate(dataset, metrics=[ragas_metric])

        score = result[metric]

    if math.isnan(score):
        raise ValueError(f"Ragas produced nan score: {score}")

    return RagasResult(
        score=score,
        cost=Money(amount=cb.total_cost, currency="USD"),
    )


# Hack to disable tqdm output from Ragas and use the one from langevals instead
@contextmanager
def disable_tqdm():
    prev_init = tqdm.__init__
    prev_init_notebook = tqdm_notebook.__init__
    tqdm.__init__ = partialmethod(tqdm.__init__, disable=True)  # type: ignore
    tqdm_notebook.__init__ = partialmethod(tqdm_notebook.__init__, disable=True)  # type: ignore

    yield

    tqdm.__init__ = prev_init
    tqdm_notebook.__init__ = prev_init_notebook
