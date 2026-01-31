def choose_configuration(language: str, passage: str, characters: str) -> str:
    return f"""Given a **Passage** and **Character**, select the appropriate option from three
fields: Character, Question_Type, Difficulty, and return the output in JSON
format.
First, select the Character who are likely to be interested in the Passage from
the candidates. Then select the Question_Type that the Character might ask
about the Passage; Finally, choose the Difficulty of the possible question
based on the Passage, the Character, and the Question_Type.
Character: Given by input **Character**

Question_Type:
- keywords: Questions asking for specific terms or key phrases from the text.
- acquire_knowledge: Questions seeking specific factual information or details presented in the text.
- summary: Questions asking for a brief overview or summary of the main points.
- yes_or_no: Questions that can be answered with a simple 'Yes' or 'No' based on the text.
- background: Questions exploring the broader context, history, or underlying concepts related to the text.

Difficulty:
- high_school: Fundamental concepts, direct information retrieval, suitable for general education.
- university: Intermediate complexity, requiring analysis or synthesis of concepts.
- phd: Advanced complexity, requiring deep domain expertise, critical evaluation, or abstract reasoning.

Here are some examples

**Passage**:
Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities.
**Character**:
Biology Teacher
**Output**:
{{"Character": "Biology Teacher", "Question_Type": "acquire_knowledge", "Difficulty": "high_school"}}

**Passage**:
The exact mechanism of high-temperature superconductivity is still not completely understood, but it is known that the critical temperature is far above the boiling point of liquid nitrogen.
**Character**:
Condensed Matter Physicist
**Output**:
{{"Character": "Condensed Matter Physicist", "Question_Type": "background", "Difficulty": "phd"}}

**Passage**:
In 2023, the global economy faced significant headwinds, including high inflation and geopolitical tensions, yet showed resilience in several key sectors.
**Character**:
Economist
**Output**:
{{"Character": "Economist", "Question_Type": "summary", "Difficulty": "university"}}

Now, generate the **output** based on the **Passage** and **Character** from
user, the **Passage** will be in {language} language and the **Character**
will be in English.
Ensure to generate only the JSON output with content in English.

**Passage**:
{passage}
**Characters**:
{", ".join(characters)}
"""
