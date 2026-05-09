import pandas as pd
import math
import ast

# Load dataset
data = pd.read_csv("authentication_data.csv")

# Algorithm 1 (AICAA)
def adaptive_click_authentication(saved_coords, login_coords, tolerance=0.05):

    if len(saved_coords) != len(login_coords):
        return False

    for (x1,y1),(x2,y2) in zip(saved_coords,login_coords):

        distance = math.sqrt((x1-x2)**2 + (y1-y2)**2)

        if distance > tolerance:
            return False

    return True


correct_success = 0
false_accept = 0

total = len(data)

for index,row in data.iterrows():

    registration = ast.literal_eval(row["Registration_Clicks"])
    correct_login = ast.literal_eval(row["Correct_Login"])
    wrong_login = ast.literal_eval(row["Wrong_Login"])

    if adaptive_click_authentication(registration,correct_login):

        correct_success += 1

    if adaptive_click_authentication(registration,wrong_login):

        false_accept += 1


accuracy = correct_success/total
false_accept_rate = false_accept/total


print("Total Users Tested:",total)
print("Successful Authentication:",correct_success)
print("False Acceptance:",false_accept)
print("Accuracy:",accuracy)
print("False Acceptance Rate:",false_accept_rate)