export type EvaluatorDefinition<T extends EvaluatorTypes> = {
  name: string;
  description: string;
  category: "quality" | "rag" | "safety" | "policy" | "other" | "custom";
  docsUrl?: string;
  isGuardrail: boolean;
  requiredFields: ("input" | "output" | "contexts" | "expected_output")[];
  settings: {
    [K in keyof Evaluators[T]["settings"]]: {
      description?: string;
      default: Evaluators[T]["settings"][K];
    };
  };
  result: {
    score?: {
      description: string;
    };
    passed?: {
      description: string;
    };
  };
};

export type EvaluatorTypes = keyof Evaluators;

export type EvaluationResult = {
  status: "processed";
  score: number;
  passed?: boolean | undefined;
  details?: string | undefined;
  cost?: Money | undefined;
  raw_result?: any;
};

export type EvaluationResultSkipped = {
  status: "skipped";
  details?: string | undefined;
};

export type EvaluationResultError = {
  status: "error";
  error_type: string;
  message: string;
  traceback: string[];
};

export type SingleEvaluationResult =
  | EvaluationResult
  | EvaluationResultSkipped
  | EvaluationResultError;
export type BatchEvaluationResult = SingleEvaluationResult[];

export type Money = {
  currency: string;
  amount: number;
};

export type Evaluators = {
  "google_cloud/dlp_pii_detection": {
    settings: {
      info_types: {
        phone_number: boolean;
        email_address: boolean;
        credit_card_number: boolean;
        iban_code: boolean;
        ip_address: boolean;
        passport: boolean;
        vat_number: boolean;
        medical_record_number: boolean;
      };
      min_likelihood:
        | "VERY_UNLIKELY"
        | "UNLIKELY"
        | "POSSIBLE"
        | "LIKELY"
        | "VERY_LIKELY";
    };
  };
  "custom/basic": {
    settings: {
      rules: {
        field: "input" | "output";
        rule:
          | "contains"
          | "not_contains"
          | "matches_regex"
          | "not_matches_regex";
        value: string;
      }[];
    };
  };
  "custom/llm_boolean": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      prompt: string;
      max_tokens: number;
    };
  };
  "custom/llm_score": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      prompt: string;
      max_tokens: number;
    };
  };
  "custom/similarity": {
    settings: {
      field: "input" | "output";
      rule: "is_not_similar_to" | "is_similar_to";
      value: string;
      threshold: number;
      embedding_model:
        | "openai/text-embedding-3-small"
        | "azure/text-embedding-ada-002";
    };
  };
  "example/word_count": {
    settings: Record<string, never>;
  };
  "openai/moderation": {
    settings: {
      model: "text-moderation-stable" | "text-moderation-latest";
      categories: {
        harassment: boolean;
        harassment_threatening: boolean;
        hate: boolean;
        hate_threatening: boolean;
        self_harm: boolean;
        self_harm_instructions: boolean;
        self_harm_intent: boolean;
        sexual: boolean;
        sexual_minors: boolean;
        violence: boolean;
        violence_graphic: boolean;
      };
    };
  };
  "ragas/answer_relevancy": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      max_tokens: number;
    };
  };
  "ragas/context_precision": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      max_tokens: number;
    };
  };
  "ragas/context_recall": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      max_tokens: number;
    };
  };
  "ragas/context_relevancy": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      max_tokens: number;
    };
  };
  "ragas/context_utilization": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      max_tokens: number;
    };
  };
  "ragas/faithfulness": {
    settings: {
      model:
        | "openai/gpt-3.5-turbo-1106"
        | "openai/gpt-3.5-turbo-0125"
        | "openai/gpt-4-1106-preview"
        | "openai/gpt-4-0125-preview"
        | "azure/gpt-35-turbo-1106"
        | "azure/gpt-4-1106-preview";
      max_tokens: number;
    };
  };
  "lingua/language_detection": {
    settings: {
      check_for: "input_matches_output" | "output_matches_language";
      expected_language?:
        | "AF"
        | "AR"
        | "AZ"
        | "BE"
        | "BG"
        | "BN"
        | "BS"
        | "CA"
        | "CS"
        | "CY"
        | "DA"
        | "DE"
        | "EL"
        | "EN"
        | "EO"
        | "ES"
        | "ET"
        | "EU"
        | "FA"
        | "FI"
        | "FR"
        | "GA"
        | "GU"
        | "HE"
        | "HI"
        | "HR"
        | "HU"
        | "HY"
        | "ID"
        | "IS"
        | "IT"
        | "JA"
        | "KA"
        | "KK"
        | "KO"
        | "LA"
        | "LG"
        | "LT"
        | "LV"
        | "MI"
        | "MK"
        | "MN"
        | "MR"
        | "MS"
        | "NB"
        | "NL"
        | "NN"
        | "PA"
        | "PL"
        | "PT"
        | "RO"
        | "RU"
        | "SK"
        | "SL"
        | "SN"
        | "SO"
        | "SQ"
        | "SR"
        | "ST"
        | "SV"
        | "SW"
        | "TA"
        | "TE"
        | "TH"
        | "TL"
        | "TN"
        | "TR"
        | "TS"
        | "UK"
        | "UR"
        | "VI"
        | "XH"
        | "YO"
        | "ZH"
        | "ZU";
      min_words: number;
      threshold: number;
    };
  };
  "azure/content_safety": {
    settings: {
      severity_threshold: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      categories: {
        Hate: boolean;
        SelfHarm: boolean;
        Sexual: boolean;
        Violence: boolean;
      };
      output_type: "FourSeverityLevels" | "EightSeverityLevels";
    };
  };
  "azure/jailbreak": {
    settings: Record<string, never>;
  };
};

export const AVAILABLE_EVALUATORS: {
  [K in EvaluatorTypes]: EvaluatorDefinition<K>;
} = {
  "google_cloud/dlp_pii_detection": {
    name: `Google Cloud DLP PII Detection`,
    description: `
Google DLP PII detects personally identifiable information in text, including phone numbers, email addresses, and
social security numbers. It allows customization of the detection threshold and the specific types of PII to check.
`,
    category: "safety",
    docsUrl: "https://cloud.google.com/sensitive-data-protection/docs/apis",
    isGuardrail: true,
    requiredFields: [],
    settings: {
      info_types: {
        description: "The types of PII to check for in the input.",
        default: {
          phone_number: true,
          email_address: true,
          credit_card_number: true,
          iban_code: true,
          ip_address: true,
          passport: true,
          vat_number: true,
          medical_record_number: true,
        },
      },
      min_likelihood: {
        description:
          "The minimum confidence required for failing the evaluation on a PII match.",
        default: "POSSIBLE",
      },
    },
    result: {
      score: {
        description: "Amount of PII detected, 0 means no PII detected",
      },
      passed: {
        description:
          "If true then no PII was detected, if false then at lease one PII was detected",
      },
    },
  },
  "custom/basic": {
    name: `Custom Basic Evaluator`,
    description: `
Allows you to check for simple text matches or regex evaluation.
`,
    category: "custom",
    docsUrl: "",
    isGuardrail: true,
    requiredFields: [],
    settings: {
      rules: {
        description: undefined,
        default: [],
      },
    },
    result: {
      score: {
        description: "Returns 1 if all rules pass, 0 if any rule fails",
      },
    },
  },
  "custom/llm_boolean": {
    name: `Custom LLM Boolean Evaluator`,
    description: `
Use an LLM as a judge with a custom prompt to do a true/false boolean evaluation of the message.
`,
    category: "custom",
    docsUrl: "",
    isGuardrail: true,
    requiredFields: [],
    settings: {
      model: {
        description: "The model to use for evaluation",
        default: "openai/gpt-3.5-turbo-0125",
      },
      prompt: {
        description:
          "The system prompt to use for the LLM to run the evaluation",
        default:
          "You are an LLM evaluator. We need the guarantee that the output answers what is being asked on the input, please evaluate as False if it doesn't",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 8192,
      },
    },
    result: {
      score: {
        description: "Returns 1 if LLM evaluates it as true, 0 if as false",
      },
      passed: {
        description: "The veredict given by the LLM",
      },
    },
  },
  "custom/llm_score": {
    name: `Custom LLM Score Evaluator`,
    description: `
Use an LLM as a judge with custom prompt to do a numeric score evaluation of the message.
`,
    category: "custom",
    docsUrl: "",
    isGuardrail: false,
    requiredFields: [],
    settings: {
      model: {
        description: "The model to use for evaluation",
        default: "openai/gpt-3.5-turbo-0125",
      },
      prompt: {
        description:
          "The system prompt to use for the LLM to run the evaluation",
        default:
          "You are an LLM evaluator. Please score from 0.0 to 1.0 how likely the user is to be satisfied with this answer, from 0.0 being not satisfied at all to 1.0 being completely satisfied",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 8192,
      },
    },
    result: {
      score: {
        description: "The score given by the LLM, according to the prompt",
      },
    },
  },
  "custom/similarity": {
    name: `Semantic Similarity Evaluator`,
    description: `
Allows you to check for semantic similarity or dissimilarity between input and output and a
target value, so you can avoid sentences that you don't want to be present without having to
match on the exact text.
`,
    category: "custom",
    docsUrl: "",
    isGuardrail: true,
    requiredFields: [],
    settings: {
      field: {
        description: undefined,
        default: "output",
      },
      rule: {
        description: undefined,
        default: "is_not_similar_to",
      },
      value: {
        description: undefined,
        default: "example",
      },
      threshold: {
        description: undefined,
        default: 0.3,
      },
      embedding_model: {
        description: undefined,
        default: "openai/text-embedding-3-small",
      },
    },
    result: {
      score: {
        description:
          "How similar the input and output semantically, from 0.0 to 1.0, with 1.0 meaning the sentences are identical",
      },
      passed: {
        description:
          "Passes if the cosine similarity crosses the threshold for the defined rule",
      },
    },
  },
  "example/word_count": {
    name: `Example Evaluator`,
    description: `
This evaluator serves as a boilerplate for creating new evaluators.
`,
    category: "other",
    docsUrl: "https://path/to/official/docs",
    isGuardrail: false,
    requiredFields: ["output"],
    settings: {},
    result: {
      score: {
        description: "How many words are there in the output, split by space",
      },
    },
  },
  "openai/moderation": {
    name: `OpenAI Moderation`,
    description: `
This evaluator uses OpenAI's moderation API to detect potentially harmful content in text,
including harassment, hate speech, self-harm, sexual content, and violence.
`,
    category: "safety",
    docsUrl: "https://platform.openai.com/docs/guides/moderation/overview",
    isGuardrail: true,
    requiredFields: [],
    settings: {
      model: {
        description:
          "The model version to use, `text-moderation-latest` will be automatically upgraded over time, while `text-moderation-stable` will only be updated with advanced notice by OpenAI.",
        default: "text-moderation-stable",
      },
      categories: {
        description: "The categories of content to check for moderation.",
        default: {
          harassment: true,
          harassment_threatening: true,
          hate: true,
          hate_threatening: true,
          self_harm: true,
          self_harm_instructions: true,
          self_harm_intent: true,
          sexual: true,
          sexual_minors: true,
          violence: true,
          violence_graphic: true,
        },
      },
    },
    result: {
      score: {
        description:
          "The model's confidence on primary category where the input violates the OpenAI's policy. The value is between 0 and 1, where higher values denote higher confidence.",
      },
    },
  },
  "ragas/answer_relevancy": {
    name: `Ragas Answer Relevancy`,
    description: `
This evaluator focuses on assessing how pertinent the generated answer is to the given prompt. Higher scores indicate better relevancy.
`,
    category: "rag",
    docsUrl:
      "https://docs.ragas.io/en/latest/concepts/metrics/answer_relevance.html",
    isGuardrail: false,
    requiredFields: ["input", "output"],
    settings: {
      model: {
        description: "The model to use for evaluation.",
        default: "openai/gpt-3.5-turbo-1106",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 2048,
      },
    },
    result: {},
  },
  "ragas/context_precision": {
    name: `Ragas Context Precision`,
    description: `
This metric evaluates whether all of the ground-truth relevant items present in the contexts are ranked higher or not. Higher scores indicate better precision.
`,
    category: "rag",
    docsUrl:
      "https://docs.ragas.io/en/latest/concepts/metrics/context_precision.html",
    isGuardrail: false,
    requiredFields: ["input", "contexts", "expected_output"],
    settings: {
      model: {
        description: "The model to use for evaluation.",
        default: "openai/gpt-3.5-turbo-1106",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 2048,
      },
    },
    result: {},
  },
  "ragas/context_recall": {
    name: `Ragas Context Recall`,
    description: `
This evaluator measures the extent to which the retrieved context aligns with the annotated answer, treated as the ground truth. Higher values indicate better performance.
`,
    category: "rag",
    docsUrl:
      "https://docs.ragas.io/en/latest/concepts/metrics/context_recall.html",
    isGuardrail: false,
    requiredFields: ["contexts", "expected_output"],
    settings: {
      model: {
        description: "The model to use for evaluation.",
        default: "openai/gpt-3.5-turbo-1106",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 2048,
      },
    },
    result: {},
  },
  "ragas/context_relevancy": {
    name: `Ragas Context Relevancy`,
    description: `
This metric gauges the relevancy of the retrieved context, calculated based on both the question and contexts. The values fall within the range of (0, 1), with higher values indicating better relevancy.
`,
    category: "rag",
    docsUrl:
      "https://docs.ragas.io/en/latest/concepts/metrics/context_relevancy.html",
    isGuardrail: false,
    requiredFields: ["output", "contexts"],
    settings: {
      model: {
        description: "The model to use for evaluation.",
        default: "openai/gpt-3.5-turbo-1106",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 2048,
      },
    },
    result: {},
  },
  "ragas/context_utilization": {
    name: `Ragas Context Utilization`,
    description: `
This metric evaluates whether all of the output relevant items present in the contexts are ranked higher or not. Higher scores indicate better utilization.
`,
    category: "rag",
    docsUrl:
      "https://docs.ragas.io/en/latest/concepts/metrics/context_precision.html",
    isGuardrail: false,
    requiredFields: ["input", "output", "contexts"],
    settings: {
      model: {
        description: "The model to use for evaluation.",
        default: "openai/gpt-3.5-turbo-1106",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 2048,
      },
    },
    result: {},
  },
  "ragas/faithfulness": {
    name: `Ragas Faithfulness`,
    description: `
This evaluator assesses the extent to which the generated answer is consistent with the provided context. Higher scores indicate better faithfulness to the context.
`,
    category: "rag",
    docsUrl:
      "https://docs.ragas.io/en/latest/concepts/metrics/faithfulness.html",
    isGuardrail: false,
    requiredFields: ["output", "contexts"],
    settings: {
      model: {
        description: "The model to use for evaluation.",
        default: "openai/gpt-3.5-turbo-1106",
      },
      max_tokens: {
        description:
          "The maximum number of tokens allowed for evaluation, a too high number can be costly. Entries above this amount will be skipped.",
        default: 2048,
      },
    },
    result: {},
  },
  "lingua/language_detection": {
    name: `Lingua Language Detection`,
    description: `
This evaluator detects the language of the input and output text to check for example if the generated answer is in the same language as the prompt,
or if it's in a specific expected language.
`,
    category: "quality",
    docsUrl: "https://github.com/pemistahl/lingua-py",
    isGuardrail: true,
    requiredFields: ["input", "output"],
    settings: {
      check_for: {
        description: "What should be checked",
        default: "input_matches_output",
      },
      expected_language: {
        description: "The specific language that the output is expected to be",
        default: undefined,
      },
      min_words: {
        description:
          "Minimum number of words to check, as the language detection can be unreliable for very short texts. Inputs shorter than the minimum will be skipped.",
        default: 7,
      },
      threshold: {
        description:
          "Minimum confidence threshold for the language detection. If the confidence is lower than this, the evaluation will be skipped.",
        default: 0.25,
      },
    },
    result: {
      score: {
        description: "How many languages were detected",
      },
      passed: {
        description:
          "Passes if the detected language on the output matches the detected language on the input, or if the output matches the expected language",
      },
    },
  },
  "azure/content_safety": {
    name: `Azure Content Safety`,
    description: `
This evaluator detects potentially unsafe content in text, including hate speech,
self-harm, sexual content, and violence. It allows customization of the severity
threshold and the specific categories to check.
`,
    category: "safety",
    docsUrl:
      "https://learn.microsoft.com/en-us/azure/ai-services/content-safety/quickstart-text",
    isGuardrail: true,
    requiredFields: [],
    settings: {
      severity_threshold: {
        description:
          "The minimum severity level to consider content as unsafe, from 1 to 7.",
        default: 1,
      },
      categories: {
        description: "The categories of moderation to check for.",
        default: {
          Hate: true,
          SelfHarm: true,
          Sexual: true,
          Violence: true,
        },
      },
      output_type: {
        description:
          "The type of severity levels to return on the full 0-7 severity scale, it can be either the trimmed version with four values (0, 2, 4, 6 scores) or the whole range.",
        default: "FourSeverityLevels",
      },
    },
    result: {
      score: {
        description:
          "The severity level of the detected content from 0 to 7. A higher score indicates higher severity.",
      },
    },
  },
  "azure/jailbreak": {
    name: `Azure Jailbreak Detection`,
    description: `
This evaluator checks for jailbreak-attempt in the input using Azure's Content Safety API.
`,
    category: "safety",
    docsUrl: "",
    isGuardrail: true,
    requiredFields: ["input"],
    settings: {},
    result: {
      passed: {
        description:
          "If true then no jailbreak was detected, if false then a jailbreak was detected",
      },
    },
  },
};
