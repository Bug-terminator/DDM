import gensim

model = gensim.models.KeyedVectors.load_word2vec_format("path/to/model.bin", binary=True)

article1 = "i love you"
article2 = "you love me"

article1_vectors = [model[word] for word in article1.split() if word in model.vocab]
article2_vectors = [model[word] for word in article2.split() if word in model.vocab]


from numpy import mean

article1_vector = mean(article1_vectors, axis=0)
article2_vector = mean(article2_vectors, axis=0)

cos_sim = 1 - cosine(article1_vector, article2_vector)
print("Cosine Similarity: ", cos_sim)

from numpy.linalg import norm
euclidean_dis = norm(article1_vector - article2_vector)
print("Euclidean Distance: ",euclidean_dis)

def jaccard_similarity(list1, list2):
    s1 = set(list1)
    s2 = set(list2)
    return len(s1.intersection(s2)) / len(s1.union(s2))

articles = [article1.split(), article2.split()]
jaccard_sim = jaccard_similarity(articles[0],articles[1])
print("Jaccard Similarity: ",jaccard_sim)

