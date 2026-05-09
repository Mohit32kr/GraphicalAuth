import random
import csv

users = 200

data = []

for user in range(users):

    reg = [(round(random.random(),2),round(random.random(),2)) for i in range(3)]

    correct_login = [(x+random.uniform(-0.03,0.03),
                      y+random.uniform(-0.03,0.03)) for x,y in reg]

    wrong_login = [(round(random.random(),2),round(random.random(),2)) for i in range(3)]

    data.append([user,reg,correct_login,wrong_login])


with open("authentication_data.csv","w",newline="") as f:

    writer = csv.writer(f)

    writer.writerow(["UserID","Registration_Clicks","Correct_Login","Wrong_Login"])

    for row in data:
        writer.writerow(row)

print("Data generated successfully")