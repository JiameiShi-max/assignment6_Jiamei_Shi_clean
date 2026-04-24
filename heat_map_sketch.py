import matplotlib.pyplot as plt
import numpy as np

# Illustrative sketch values only
labels = ["Age 60+", "Hypertension", "Heart disease", "High glucose", "Smoking", "Stroke"]

data = np.array([
    [0.00, 0.35, 0.30, 0.28, 0.18, 0.75],
    [0.35, 0.00, 0.62, 0.30, 0.12, 0.68],
    [0.30, 0.62, 0.00, 0.20, 0.10, 0.72],
    [0.28, 0.30, 0.20, 0.00, 0.16, 0.50],
    [0.18, 0.12, 0.10, 0.16, 0.00, 0.22],
    [0.75, 0.68, 0.72, 0.50, 0.22, 0.00],
])

fig = plt.figure(figsize=(9.5, 7), dpi=180)
fig.patch.set_facecolor("white")

# Title
fig.text(
    0.08, 0.94,
    "Q1.5 Alternative Design: Heatmap / Matrix View",
    fontsize=18, fontweight="bold", ha="left", va="top"
)

# Subtitle
fig.text(
    0.08, 0.895,
    "Rows and columns represent attributes. Darker cells indicate stronger relationships.",
    fontsize=11.5, ha="left", va="top", color="#444444"
)

# Heatmap
ax = fig.add_axes([0.10, 0.18, 0.62, 0.62])
im = ax.imshow(data, cmap="Blues", vmin=0, vmax=0.80)

ax.set_xticks(range(len(labels)))
ax.set_yticks(range(len(labels)))
ax.set_xticklabels(labels, rotation=30, ha="right", fontsize=11)
ax.set_yticklabels(labels, fontsize=11)

ax.set_xlabel("Attribute", fontsize=12)
ax.set_ylabel("Attribute", fontsize=12)

# Cell labels
for i in range(len(labels)):
    for j in range(len(labels)):
        if i == j:
            txt = "—"
            color = "#444444"
        else:
            txt = f"{int(round(data[i, j] * 100))}%"
            color = "white" if data[i, j] >= 0.50 else "#222222"
        ax.text(j, i, txt, ha="center", va="center", fontsize=10.5, color=color)

# Border
for spine in ax.spines.values():
    spine.set_linewidth(1.2)
    spine.set_color("#222222")

# Simple callout text on the right
fig.text(
    0.77, 0.72,
    "Why use a heatmap?",
    fontsize=13.5, fontweight="bold", ha="left"
)

fig.text(
    0.77, 0.64,
    "• Easier to compare pairwise strength\n\n"
    "• Fixed layout, no edge crossing\n\n"
    "• Can include more attributes clearly",
    fontsize=11, ha="left", va="top"
)

fig.text(
    0.77, 0.42,
    "Encoding",
    fontsize=13.5, fontweight="bold", ha="left"
)

fig.text(
    0.77, 0.34,
    "Rows / columns: attributes\n\n"
    "Cell color: relationship strength",
    fontsize=11, ha="left", va="top"
)

# Footer
fig.text(
    0.08, 0.06,
    "Sketch only: values are illustrative. The purpose is to show the layout, marks, and encoding.",
    fontsize=10, color="#666666", ha="left"
)

plt.savefig("Q1_5_heatmap_sketch_clean.png", bbox_inches="tight")
plt.show()