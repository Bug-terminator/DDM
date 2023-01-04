import torch
import torch.nn as nn

# Define the RNN model
class RNNEmbedding(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.rnn = nn.RNN(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        # x should have shape (batch_size, seq_length, input_size)
        output, _ = self.rnn(x)
        # output has shape (batch_size, seq_length, hidden_size)
        output = self.fc(output)
        # output has shape (batch_size, seq_length, output_size)
        return output

# Instantiate the model
input_size = 128
hidden_size = 256
output_size = 64
model = RNNEmbedding(input_size, hidden_size, output_size)

# Define the loss function and optimizer
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters())

# Train the model
for epoch in range(num_epochs):
    for data, labels in train_loader:
        data = data.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, labels)
        loss.backward()
        optimizer.step()
