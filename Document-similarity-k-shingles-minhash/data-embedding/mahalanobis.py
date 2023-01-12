import pandas as pd
from scipy.spatial import distance


df1 = pd.DataFrame({'Name': ['Alice', 'Bob', 'Carol'],
                   'Age': [25, 30, 35],
                   'Gender': ['Female', 'Male', 'Female'],
                   'Salary': [50000, 60000, 70000],
                   'Education': ['Bachelor', 'Master', 'Ph.D']})


df2 = pd.DataFrame({'Name': ['David', 'Eve', 'Frank'],
                   'Age': [28, 32, 40],
                   'Gender': ['Male', 'Female', 'Male'],
                   'Salary': [55000, 65000, 75000],
                   'Education': ['Bachelor', 'Master', 'Ph.D']})


df1 = pd.get_dummies(df1, columns=['Gender', 'Education'])
df2 = pd.get_dummies(df2, columns=['Gender', 'Education'])

cov_matrix1 = df1.cov()
cov_matrix2 = df2.cov()

Mahalanobis_dis = distance.mahalanobis(df1.values, df2.values, np.linalg.inv(cov_matrix1), np.linalg.inv(cov_matrix2))
print("Mahalanobis Distance: ", Mahalanobis_dis)

