"use client";

import { ActionButton } from "@heiso/core/components/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@heiso/core/components/ui/alert-dialog";
import { Button } from "@heiso/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@heiso/core/components/ui/dialog";
import { Input } from "@heiso/core/components/ui/input";
import { Label } from "@heiso/core/components/ui/label";
import { ScrollArea } from "@heiso/core/components/ui/scroll-area";
import { cn } from "@heiso/core/lib/utils";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import * as React from "react";

type TreeNode = {
  id: string;
  name: string;
  slug: string;
  children?: TreeNode[];
};

type TreeViewSelectProps = {
  name: string;
  data: TreeNode[];
  onAdd?: (newNode: Omit<TreeNode, "id">, parentId: string | null) => void;
  onUpdate?: (nodeId: string, newName: string, newSlug: string) => void;
  onDelete?: (nodeId: string) => void;
  onChange?: (value: string) => void;
  isAddPending?: boolean;
  isUpdatePending?: boolean;
  isDeletePending?: boolean;
  value?: string;
  description?: string;
  className?: string;
  scrollAreaClassName?: string;
};

const TreeViewSelect = React.forwardRef(
  (
    {
      name,
      data = [],
      onAdd,
      onUpdate,
      onDelete,
      onChange,
      isAddPending,
      isUpdatePending,
      isDeletePending,
      value,
      description,
      className,
      scrollAreaClassName,
    }: TreeViewSelectProps,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(
      new Set(),
    );
    const [searchTerm, setSearchTerm] = React.useState("");
    const [newNodeName, setNewNodeName] = React.useState("");
    const [newNodeSlug, setNewNodeSlug] = React.useState("");
    const [updatedNodeName, setUpdatedNodeName] = React.useState("");
    const [updatedNodeSlug, setUpdatedNodeSlug] = React.useState("");
    const [addingToParent, setAddingToParent] = React.useState<{
      id: string | null;
      name: string;
    } | null>(null);
    const [updatingNodeId, setUpdatingNodeId] = React.useState<string | null>(
      null,
    );
    const [nodeToDelete, setNodeToDelete] = React.useState<TreeNode | null>(
      null,
    );
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const findNodePath = React.useCallback(
      (
        nodes: TreeNode[],
        targetId: string,
        path: string[] = [],
      ): string[] | null => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return [...path, node.id];
          }
          if (node.children) {
            const result = findNodePath(node.children, targetId, [
              ...path,
              node.id,
            ]);
            if (result) {
              return result;
            }
          }
        }
        return null;
      },
      [],
    );

    React.useEffect(() => {
      if (value) {
        const path = findNodePath(data, value);
        if (path) {
          setExpandedNodes(new Set(path));
        }
      }
    }, [findNodePath, value, data]);

    const toggleNode = (nodeId: string) => {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    };

    const handleAddNode = () => {
      if (newNodeName.trim() && onAdd) {
        onAdd(
          { name: newNodeName.trim(), slug: newNodeSlug.trim() },
          addingToParent?.id ?? null,
        );
        setNewNodeName("");
        setNewNodeSlug("");
        setAddingToParent(null);
        setIsAddDialogOpen(false);
      }
    };

    const handleUpdateNode = () => {
      if (updatedNodeName.trim() && onUpdate && updatingNodeId) {
        onUpdate(
          updatingNodeId,
          updatedNodeName.trim(),
          updatedNodeSlug.trim(),
        );
        setUpdatedNodeName("");
        setUpdatedNodeSlug("");
        setUpdatingNodeId(null);
        setIsUpdateDialogOpen(false);
      }
    };

    const handleDeleteNode = () => {
      if (onDelete && nodeToDelete) {
        onDelete(nodeToDelete.id);
        setNodeToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    };

    const isNodeVisible = (node: TreeNode): boolean => {
      if (searchTerm === "") return true;
      if (node.name.toLowerCase().includes(searchTerm.toLowerCase()))
        return true;
      if (node.children) {
        return node.children.some(isNodeVisible);
      }
      return false;
    };

    const renderTreeNodes = (
      name: string,
      nodes: TreeNode[] = [],
      level = 0,
    ): React.ReactNode => {
      return nodes.map((node) => {
        const isVisible = isNodeVisible(node);
        if (!isVisible) return null;

        return (
          <div
            ref={ref}
            key={node.id}
            className={cn("py-1", level > 0 && "ml-4")}
          >
            <div className="flex items-center">
              {node.children && node.children.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-none h-6 w-6 p-0 mr-1"
                  onClick={() => toggleNode(node.id)}
                >
                  {expandedNodes.has(node.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <span className="w-6 mr-1" />
              )}
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "flex-1 h-6 px-2 py-1 text-sm justify-start font-normal w-full",
                  value === node.id &&
                    "bg-accent text-accent-foreground font-medium",
                )}
                onClick={() => onChange?.(node.id)}
              >
                {node.name}
              </Button>
              <div className="flex-none">
                {onAdd && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 ml-auto"
                    onClick={() => {
                      setAddingToParent(node);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {onUpdate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => {
                      setUpdatingNodeId(node.id);
                      setUpdatedNodeName(node.name);
                      setUpdatedNodeSlug(node.slug);
                      setIsUpdateDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => {
                      setNodeToDelete(node);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {node.children &&
              node.children.length > 0 &&
              (expandedNodes.has(node.id) || searchTerm !== "") && (
                <div className="mt-1">
                  {renderTreeNodes(name, node.children, level + 1)}
                </div>
              )}
          </div>
        );
      });
    };

    return (
      <div className={className}>
        <div className={cn("rounded-md border mt-2")}>
          <div className="p-2 border-b">
            <Input
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <ScrollArea className={cn("h-[300px]", scrollAreaClassName)}>
            <div className="p-2">
              {data && data.length > 0 ? (
                renderTreeNodes(name, data)
              ) : (
                <p>No data available</p>
              )}
              {onAdd && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setAddingToParent(null);
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add {name}
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {name}</DialogTitle>
              <DialogDescription>
                {addingToParent
                  ? `Enter the name for the ${name} under "${addingToParent.name}"`
                  : `Enter the name for the ${name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-node-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="new-node-name"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-node-slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="new-node-slug"
                  value={newNodeSlug}
                  onChange={(e) => setNewNodeSlug(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <ActionButton
                type="button"
                onClick={handleAddNode}
                loading={!!isAddPending}
              >
                Create
              </ActionButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this {name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the{" "}
                {name}
                {nodeToDelete?.children &&
                  nodeToDelete.children.length > 0 &&
                  " and all its children"}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <ActionButton
                  type="button"
                  onClick={handleDeleteNode}
                  loading={!!isDeletePending}
                >
                  Delete
                </ActionButton>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Node</DialogTitle>
              <DialogDescription>
                Enter the new name for the node.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-node-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="update-node-name"
                  value={updatedNodeName}
                  onChange={(e) => setUpdatedNodeName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-node-slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="update-node-slug"
                  value={updatedNodeSlug}
                  onChange={(e) => setUpdatedNodeSlug(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <ActionButton
                type="button"
                onClick={handleUpdateNode}
                loading={!!isUpdatePending}
              >
                Update Node
              </ActionButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

TreeViewSelect.displayName = "TreeViewSelect";

const TreeViewSelectDemo = () => {
  const [treeData, setTreeData] = React.useState<TreeNode[]>([
    {
      id: "1",
      name: "Electronics",
      slug: "electronics",
      children: [
        { id: "1-1", name: "Smartphones", slug: "smartphones" },
        { id: "1-2", name: "Laptops", slug: "laptops" },
        {
          id: "1-3",
          name: "Accessories",
          slug: "accessories",
          children: [
            { id: "1-3-1", name: "Headphones", slug: "headphones" },
            { id: "1-3-2", name: "Chargers", slug: "chargers" },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Clothing",
      slug: "clothing",
      children: [
        { id: "2-1", name: "Men's", slug: "mens" },
        { id: "2-2", name: "Women's", slug: "womens" },
        { id: "2-3", name: "Kids", slug: "kids" },
      ],
    },
    { id: "3", name: "Books", slug: "books" },
  ]);

  const [selectedCategory, setSelectedCategory] = React.useState("");

  const handleAddNode = (
    newNode: Omit<TreeNode, "id">,
    parentId: string | null,
  ) => {
    try {
      const newId = Date.now().toString();
      const addNodeToTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), { id: newId, ...newNode }],
            };
          } else if (node.children) {
            return {
              ...node,
              children: addNodeToTree(node.children),
            };
          }
          return node;
        });
      };

      if (parentId === null) {
        setTreeData((prevData) => [...prevData, { id: newId, ...newNode }]);
      } else {
        setTreeData((prevData) => addNodeToTree(prevData));
      }
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const handleUpdateNode = (nodeId: string, newName: string) => {
    const updateNodeInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, name: newName };
        } else if (node.children) {
          return {
            ...node,
            children: updateNodeInTree(node.children),
          };
        }
        return node;
      });
    };

    setTreeData((prevData) => updateNodeInTree(prevData));
  };

  const handleDeleteNode = (nodeId: string) => {
    const deleteNodeFromTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => {
          if (node.children) {
            return {
              ...node,
              children: deleteNodeFromTree(node.children),
            };
          }
          return node;
        });
    };

    setTreeData((prevData) => deleteNodeFromTree(prevData));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Selected category:", selectedCategory);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TreeViewSelect
        name="category"
        data={treeData}
        onAdd={handleAddNode}
        onUpdate={handleUpdateNode}
        onDelete={handleDeleteNode}
        onChange={setSelectedCategory}
        value={selectedCategory}
        // description="Select a category for your product"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export type { TreeNode };
export { TreeViewSelect, TreeViewSelectDemo };
