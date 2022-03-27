# import tablulate
from tabulate import tabulate
from scipy.stats import chi2

data = [[38,7],[15,15],[7,8]]
total = 93
print(round(45*60/total,2))
print(round(45*30/total,2))
print(round(30*60/total,2))
print(round(30*30/total,2))
print(round(15*60/total,2))
print(round(15*30/total,2))
expected = [0,0,0,0,0,0]
expected[0] = round(45*30/total,4)
expected[1] = round(45*63/total,4)
expected[2] = round(32*30/total,4)
expected[3] = round(32*63/total,4)
expected[4] = round(16*30/total,4)
expected[5] = round(16*63/total,4)
print(expected)
observed = [38,7,15,15,7,8]

colnum = input('cols ')
rows = input('rows ')
precision = int(input('precision '))
# create array with cols and rows
# ask user for data
data = [[int(input("col " + str(x) + " row " + str(y) + ": ")) for x in range(int(colnum))] for y in range(int(rows))]

# calculate expected values for each cell from (column total * row total) / total
rowTotals = [sum(row) for row in data]
colTotals = [sum(col) for col in zip(*data)]
total = sum(rowTotals)
result = [[0 for x in range(int(colnum))] for y in range(int(rows))]
for x in range(int(colnum)):
    for y in range(int(rows)):
         result[y][x] = round((rowTotals[y] * colTotals[x]) / total,precision)
        
# print result
print(tabulate(result, headers=["col " + str(x) for x in range(int(colnum))]))

# calculate chi-square
chisq = 0
for x in range(int(colnum)):
    for y in range(int(rows)):
        chisq += (int(data[y][x]) - result[y][x]) ** 2 / result[y][x]
      
print("chi-square: " + str(chisq))

# calculate p-value
pval = 1 - chi2.cdf(chisq, (int(colnum) - 1) * (int(rows) - 1))

# print p-value
print("p-value: " + str(pval))