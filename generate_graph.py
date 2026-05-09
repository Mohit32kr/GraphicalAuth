import matplotlib.pyplot as plt

# Data from experiment results
methods = ["Basic System", "Proposed System"]

accuracy = [0.85, 0.94]
security = [0.70, 0.92]
usability = [0.80, 0.91]

# Accuracy Graph
plt.figure()
plt.bar(methods, accuracy)
plt.title("Authentication Accuracy Comparison")
plt.ylabel("Accuracy")
plt.xlabel("Authentication Methods")
plt.show()


# Security Graph
plt.figure()
plt.bar(methods, security)
plt.title("Security Strength Comparison")
plt.ylabel("Security Score")
plt.xlabel("Authentication Methods")
plt.show()


# Usability Graph
plt.figure()
plt.bar(methods, usability)
plt.title("Usability Comparison")
plt.ylabel("Usability Score")
plt.xlabel("Authentication Methods")
plt.show()