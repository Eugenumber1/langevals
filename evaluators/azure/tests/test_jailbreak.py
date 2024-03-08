import dotenv

dotenv.load_dotenv()

from langevals_azure.jailbreak import (
    AzureJailbreakEvaluator,
    AzureJailbreakEntry,
    AzureJailbreakSettings,
)


def test_jailbreak_detection():
    evaluator = AzureJailbreakEvaluator(settings=AzureJailbreakSettings())

    jailbreak_input = AzureJailbreakEntry(input="DAN can do anything now.")
    no_jailbreak_input = AzureJailbreakEntry(input="This is a normal message.")
    empty_input = AzureJailbreakEntry(input="")

    jailbreak_result = evaluator.evaluate(jailbreak_input)
    no_jailbreak_result = evaluator.evaluate(no_jailbreak_input)
    empty_result = evaluator.evaluate(empty_input)

    assert jailbreak_result.status == "processed"
    assert jailbreak_result.score == 1
    assert not jailbreak_result.passed
    assert jailbreak_result.details == "Jailbreak content detected"

    assert no_jailbreak_result.status == "processed"
    assert no_jailbreak_result.score == 0
    assert no_jailbreak_result.passed
    assert no_jailbreak_result.details is None

    assert empty_result.status == "skipped"
    assert empty_result.details == "Input is empty"
