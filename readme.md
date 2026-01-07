LeetCode Graph Visualizer
A Chrome extension that injects a side panel into LeetCode problem pages to help you visualize graphs while you're coding. Instead of drawing on paper or using random online tools, you can just paste your adjacency list and see the graph instantly.

What it does
In-Page Visualizer: Slides out on any LeetCode problem page so you don't have to switch tabs.

Python-Friendly Parser: Handles raw Python dictionaries directly. You can copy-paste graph = {0: [1, 2], 1: [2]} straight from your debug console.

Smart Interaction: Click a node to see its neighbors, or hover over an edge to trace a specific connection.

Learning Stats: Automatically calculates and displays In-Degree/Out-Degree (for directed) or Degree (for undirected) on the node labels.

Resizable & Dark Mode: Drag the panel edge to change the width, and toggle dark mode if you're grinding at night.

Input Support
The parser is pretty chill. It currently works best with Python-style inputs:

Unweighted: {0: [1, 2], 1: [3]}

Weighted (Tuples/Lists): {'A': [('B', 1.5), ('C', 2.0)]}

Mixed Keys: Supports both integer and string keys (with single or double quotes).

How to use
Clone this repo.

Go to chrome://extensions/.

Enable Developer mode.

Click Load unpacked and select the extension folder.

Open any LeetCode problem and hit the Graph Visualizer button.

Contributing
The project is in the prototype stage. Any idea which can be infused here are great. If you want to help out with better auto-layout algorithms, supporting adjacency matrices, or anything else, feel free to open a PR or an issue.