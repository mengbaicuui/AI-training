def generate_query(
    corpus_language: str,
    queries_language: str,
    passage: str,
    character: str,
    query_difficulty: str,
    query_language: str,
    query_length: int,
    query_type: str,
) -> str:
    return f"""Given a **Character**, **Passage**, and **Requirement**, generate a query from
the **Character**'s perspective that satisfies the **Requirement** and can
be used to retrieve the **Passage**. Please return the result in JSON
format.

Here is an example:
**Character**
Curious Student
**Passage**
The Great Wall of China is a series of fortifications that were built across the historical northern borders of ancient Chinese states and Imperial China as protection against various nomadic groups from the Eurasian Steppe.
**Requirment**
- Type: acquire_knowledge;
- Difficulty: high_school;
- Length: the length of the generated sentences should be 20 words;
- Languange: the language in which the results are generated should be English language;
**Output**
{{"query": "Why was the Great Wall of China built and who was it intended to protect against?"}}

Now, generate the **output** based on the **Character**, **Passage** and
**Requirement** from user, the **Passage** will be in {corpus_language}
language, the **Character** and **Requirement** will be in English.
Ensure to generate only the JSON output, with the key in English and the value
in {queries_language} language.

Attention: when language is Chines, only split words with space when type is keyword

**Character**
{character}
**Passage**
{passage}
**Requirment**
- Type: {query_type};
- Difficulty: {query_difficulty};
- Length: the length of the generated sentences should be {query_length} words;
- Languange: the language in which the results are generated should be
{query_language} language;
"""
