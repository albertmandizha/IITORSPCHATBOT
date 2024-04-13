import tensorflow as tf
import tensorflow_hub as hub
import numpy as np

def preprocess_text(text):
    return text.lower().strip()

def find_similar_question(new_question, stored_questions, stored_answers):

    # Ensure consistent preprocessing for all questions
    new_question = preprocess_text(new_question)
    stored_questions = [preprocess_text(q) for q in stored_questions]

    # Load the Universal Sentence Encoder model
    embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

    # Enable NumPy behavior for eager execution
    tf.experimental.numpy.experimental_enable_numpy_behavior()

    # Correctly prepare inputs for the model
    new_question_inputs = np.array([new_question])  # Single string in an array
    stored_question_inputs = np.array(stored_questions)

    # Embed questions using the model
    new_question_embedding = embed(new_question_inputs)[0]
    stored_question_embeddings = embed(stored_question_inputs)

    # Calculate cosine similarities between the new question and stored questions
    similarities = np.dot(new_question_embedding, stored_question_embeddings.T)

    # Find the index of the most similar question
    most_similar_index = np.argmax(similarities)

    # Retrieve the most similar question and answer
    most_similar_question = stored_questions[most_similar_index]
    most_similar_answer = stored_answers[most_similar_index]

    return most_similar_question, most_similar_answer

# Example usage
stored_questions = ["what is the meaning of life?", "how to learn coding?", "capital of France?"]
stored_answers = ["42", "many online resources", "Paris"]
new_question = "best way to learn Java?"

most_similar_question, most_similar_answer = find_similar_question(new_question, stored_questions, stored_answers)

print("Most similar question:", most_similar_question)
print("New Question:",new_question)
print("Answer:", most_similar_answer)
