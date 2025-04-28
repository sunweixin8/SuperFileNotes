const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const historyNote = require('./historyNote.js');

class RemarkTreeItem extends vscode.TreeItem {
    constructor(label, filePath, isFolder, remark, childItems) {
        super(
            label, 
            isFolder || (childItems && childItems.length > 0)
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.None
        );

        this.filePath = filePath;
        this.isFolder = isFolder;
        this.childItems = childItems || [];
        
        if (remark) {
            this.tooltip = remark;
            this.description = remark;
        }

        // Set icon based on type
        if (isFolder) {
            this.iconPath = vscode.ThemeIcon.Folder;
            this.contextValue = "folder";
        } else {
            this.iconPath = vscode.ThemeIcon.File;
            this.contextValue = "file";
            
            // Add command to open file when clicked
            this.resourceUri = vscode.Uri.file(filePath);
            this.command = {
                command: 'vscode.open',
                arguments: [this.resourceUri],
                title: 'Open File'
            };
        }
    }
}

class RemarkTreeProvider {
    constructor(workspaceRoot) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.workspaceRoot = workspaceRoot;
    }

    refresh() {
        this._onDidChangeTreeData.fire(null);
    }

    getTreeItem(element) {
        return element;
    }

    async getChildren(element) {
        if (!this.workspaceRoot) {
            return Promise.resolve([]);
        }

        // If we're getting children of a specific element, return its child items
        if (element) {
            return Promise.resolve(element.childItems || []);
        } 
        
        // Otherwise, build the root level of the tree
        try {
            const remarks = await historyNote();
            if (remarks.length === 0) {
                return Promise.resolve([
                    new vscode.TreeItem('没有找到备注', vscode.TreeItemCollapsibleState.None)
                ]);
            }

            // Build hierarchical tree of remarked files and directories
            const rootItems = await this._buildHierarchicalTree(remarks);
            return Promise.resolve(rootItems);
        } catch (error) {
            console.error('Error getting remarks:', error);
            return Promise.resolve([
                new vscode.TreeItem('加载备注时出错', vscode.TreeItemCollapsibleState.None)
            ]);
        }
    }
    
    // Build a hierarchical tree structure for remarked items
    async _buildHierarchicalTree(remarks) {
        // First, normalize all paths and collect them in a map
        const normalizedRemarks = new Map();
        for (const remark of remarks) {
            const normalizedPath = remark.path.replace(/\\/g, '/');
            if (!normalizedRemarks.has(normalizedPath)) {
                normalizedRemarks.set(normalizedPath, []);
            }
            normalizedRemarks.get(normalizedPath).push(remark);
        }
        
        // Get all paths that have remarks
        const remarkedPaths = Array.from(normalizedRemarks.keys());
        
        // Virtual file system root node
        const rootNode = { 
            isFolder: true, 
            children: new Map(), 
            remarks: null, 
            name: "/" 
        };
        
        // Build the tree structure
        for (const filePath of remarkedPaths) {
            const pathSegments = filePath.split('/').filter(segment => segment.length > 0);
            let currentNode = rootNode;
            let currentPath = "";
            
            // Process each path segment
            for (let i = 0; i < pathSegments.length; i++) {
                const segment = pathSegments[i];
                currentPath += '/' + segment;
                const isLastSegment = (i === pathSegments.length - 1);
                
                // If this segment doesn't exist in the tree yet, add it
                if (!currentNode.children.has(segment)) {
                    const segmentIsDirectory = !isLastSegment || this._isDirectory(this.workspaceRoot + currentPath);
                    const newNode = {
                        isFolder: segmentIsDirectory,
                        children: new Map(),
                        remarks: normalizedRemarks.get(currentPath.substring(1)) || null, // trim leading /
                        name: segment
                    };
                    currentNode.children.set(segment, newNode);
                }
                
                // Move down to the child node for the next iteration
                currentNode = currentNode.children.get(segment);
            }
        }
        
        // Convert the tree structure to TreeItems
        const rootItems = this._convertTreeNodeToTreeItems(rootNode, "", true);
        return rootItems;
    }
    
    // Check if a path points to a directory
    _isDirectory(fullPath) {
        try {
            if (fs.existsSync(fullPath)) {
                return fs.statSync(fullPath).isDirectory();
            }
        } catch (e) {
            // If we can't determine, make a best guess
            return !path.extname(fullPath);
        }
        return false;
    }
    
    // Convert a tree node to TreeItems
    _convertTreeNodeToTreeItems(node, currentPath, isRoot = false) {
        const items = [];
        
        // Skip the virtual root node
        if (isRoot) {
            // For the root node, directly process children
            const sortedChildren = Array.from(node.children.entries())
                .sort((a, b) => {
                    // Folders first
                    if (a[1].isFolder && !b[1].isFolder) return -1;
                    if (!a[1].isFolder && b[1].isFolder) return 1;
                    // Then alphabetically
                    return a[0].localeCompare(b[0]);
                });
            
            for (const [name, childNode] of sortedChildren) {
                const childPath = currentPath + '/' + name;
                
                let childItems = [];
                if (childNode.children.size > 0) {
                    childItems = this._convertTreeNodeToTreeItems(childNode, childPath);
                }
                
                // Only include this node if it has remarks or it has children that should be shown
                const hasRemarks = childNode.remarks !== null;
                const hasNonEmptyChildren = childItems.length > 0;
                
                if (hasRemarks || hasNonEmptyChildren) {
                    const absolutePath = path.join(this.workspaceRoot, childPath.substring(1)); // remove leading /
                    
                    // Create remark text
                    let remarkText = null;
                    if (hasRemarks) {
                        const nodeRemarks = childNode.remarks;
                        remarkText = nodeRemarks[0].text;
                        if (nodeRemarks.length > 1) {
                            remarkText = `(${nodeRemarks.length}) ${remarkText}`;
                        }
                    }
                    
                    const treeItem = new RemarkTreeItem(
                        name,
                        absolutePath,
                        childNode.isFolder,
                        remarkText,
                        childItems
                    );
                    
                    items.push(treeItem);
                } else if (childNode.isFolder) {
                    // For directories without remarks, check if they have any remarked files in their subtree
                    // If not, don't include them; if yes, include them as structural elements
                    
                    // Find if any descendant has remarks
                    const hasRemarkedDescendant = this._hasRemarkedDescendant(childNode);
                    
                    if (hasRemarkedDescendant) {
                        const absolutePath = path.join(this.workspaceRoot, childPath.substring(1));
                        
                        const treeItem = new RemarkTreeItem(
                            name,
                            absolutePath,
                            true, // isFolder
                            null, // no remark
                            childItems
                        );
                        
                        items.push(treeItem);
                    }
                }
            }
        } else {
            // For non-root nodes, process the children
            const sortedChildren = Array.from(node.children.entries())
                .sort((a, b) => {
                    // Folders first
                    if (a[1].isFolder && !b[1].isFolder) return -1;
                    if (!a[1].isFolder && b[1].isFolder) return 1;
                    // Then alphabetically
                    return a[0].localeCompare(b[0]);
                });
            
            for (const [name, childNode] of sortedChildren) {
                const childPath = currentPath + '/' + name;
                
                let childItems = [];
                if (childNode.children.size > 0) {
                    childItems = this._convertTreeNodeToTreeItems(childNode, childPath);
                }
                
                // Only include this node if it has remarks or it has children that should be shown
                const hasRemarks = childNode.remarks !== null;
                const hasNonEmptyChildren = childItems.length > 0;
                
                if (hasRemarks || hasNonEmptyChildren) {
                    const absolutePath = path.join(this.workspaceRoot, childPath.substring(1)); // remove leading /
                    
                    // Create remark text
                    let remarkText = null;
                    if (hasRemarks) {
                        const nodeRemarks = childNode.remarks;
                        remarkText = nodeRemarks[0].text;
                        if (nodeRemarks.length > 1) {
                            remarkText = `(${nodeRemarks.length}) ${remarkText}`;
                        }
                    }
                    
                    const treeItem = new RemarkTreeItem(
                        name,
                        absolutePath,
                        childNode.isFolder,
                        remarkText,
                        childItems
                    );
                    
                    items.push(treeItem);
                }
            }
        }
        
        return items;
    }
    
    // Check if a node has any descendants with remarks
    _hasRemarkedDescendant(node) {
        if (node.remarks !== null) {
            return true;
        }
        
        for (const childNode of node.children.values()) {
            if (this._hasRemarkedDescendant(childNode)) {
                return true;
            }
        }
        
        return false;
    }
}

module.exports = RemarkTreeProvider; 