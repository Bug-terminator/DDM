from transformers import BertModel

bert = BertModel.from_pretrained("bert-base-uncased")
from transformers import BertTokenizer

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
text = "I love playing football on the weekends"
input_ids = tokenizer.encode(text, return_tensors="pt")

outputs = bert(input_ids)
word_vectors = outputs[0]

article_tensor = word_vectors.detach().numpy()
