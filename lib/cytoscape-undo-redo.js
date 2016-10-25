;(function () {
    'use strict';

// registers the extension on a cytoscape lib ref
    var register = function (cytoscape) {

        if (!cytoscape) {
            return;
        } // can't register if cytoscape unspecified

        var cy;
        var actions = {};
        var undoStack = [];
        var redoStack = [];

        var _instance = {
            options: {
                isDebug: false, // Debug mode for console messages
                actions: {},// actions to be added
                undoableDrag: true, // Whether dragging nodes are undoable can be a function as well
                beforeUndo: function () { // callback before undo is triggered.

                },
                afterUndo: function () { // callback after undo is triggered.

                },
                beforeRedo: function () { // callback before redo is triggered.

                },
                afterRedo: function () { // callback after redo is triggered.

                },
                ready: function () {

                }
            }
        };
        

        // design implementation
        cytoscape("core", "undoRedo", function (options, dontInit) {
            cy = this;



            function getScratch() {
                if (!cy.scratch("_undoRedo")) {
                    cy.scratch("_undoRedo", { });

                }
                return cy.scratch("_undoRedo");
            }

            if (options) {
                for (var key in options)
                    if (_instance.options.hasOwnProperty(key))
                        _instance.options[key] = options[key];

                if (options.actions)
                    for (var key in options.actions)
                        actions[key] = options.actions[key];

                
            }
            
            if (!getScratch().isInitialized && !dontInit) {

                var defActions = defaultActions();
                for (var key in defActions)
                    actions[key] = defActions[key];


                setDragUndo(_instance.options.undoableDrag);
                getScratch().isInitialized = true;
            }

            _instance.options.ready();
            return _instance;

        });
        
        _instance.getPaddingsMap = getPaddingsMap;

        // Undo last action
        _instance.undo = function () {
            if (!this.isUndoStackEmpty()) {

                var action = undoStack.pop();
                cy.trigger("beforeUndo", [action.name, action.args]);
                
                // The next paddings map to return back
                var nextPaddingsToReturn = getPaddingsMap();

                var res = actions[action.name]._undo(action.args);
                
                // Complete the resulting parameters and return to the given paddings
                res.paddingsToReturn = nextPaddingsToReturn;

                // Return the paddings given by the param
                var paddingsToReturn = action.args.paddingsToReturn;
                returnToPaddings(paddingsToReturn);
                
                redoStack.push({
                    name: action.name,
                    args: res
                });

                cy.trigger("afterUndo", [action.name, action.args]);
                return res;
            } else if (_instance.options.isDebug) {
                console.log("Undoing cannot be done because undo stack is empty!");
            }
        };

        // Redo last action
        _instance.redo = function () {

            if (!this.isRedoStackEmpty()) {
                var action = redoStack.pop();

                cy.trigger(action.firstTime ? "beforeDo" : "beforeRedo", [action.name, action.args]);

                // The next paddings map to return back
                var nextPaddingsToReturn;
                        
                // If this is a do action (That is 'firstTime' is truthy) and paddingsToReturn is not specified by the user
                // set 'nextPaddingsToReturn'
                if ( action.firstTime && !action.args.paddingsToReturn ) {
                    nextPaddingsToReturn = getPaddingsMap();
                }
                else {
                    nextPaddingsToReturn = action.args.paddingsToReturn;
                }
                
                if (!action.args)
                  action.args = {};
                action.args.firstTime = action.firstTime ? true : false;

                var res = actions[action.name]._do(action.args);

                // If this is not a do action return the stored paddings
                if ( !action.firstTime  ) {
                    var paddingsToReturn = action.args.paddingsToReturn;
                    returnToPaddings(paddingsToReturn);
                }
                
                // introduce the next paddings to return
                res.paddingsToReturn = nextPaddingsToReturn;

                undoStack.push({
                    name: action.name,
                    args: res
                });

                cy.trigger(action.firstTime ? "afterDo" : "afterRedo", [action.name, action.args]);
                return res;
            } else if (_instance.options.isDebug) {
                console.log("Redoing cannot be done because redo stack is empty!");
            }

        };

        // Calls registered function with action name actionName via actionFunction(args)
        _instance.do = function (actionName, args) {

            redoStack = [];
            redoStack.push({
                name: actionName,
                args: args,
                firstTime: true
            });

            return this.redo();
        };

        // Register action with its undo function & action name.
        _instance.action = function (actionName, _do, _undo) {

            actions[actionName] = {
                _do: _do,
                _undo: _undo
            };


            return _instance;
        };

        // Removes action stated with actionName param
        _instance.removeAction = function (actionName) {
            delete actions[actionName];
        };

        // Gets whether undo stack is empty
        _instance.isUndoStackEmpty = function () {
            return (undoStack.length === 0);
        };

        // Gets whether redo stack is empty
        _instance.isRedoStackEmpty = function () {
            return (redoStack.length === 0);
        };

        // Gets actions (with their args) in undo stack
        _instance.getUndoStack = function () {
            return undoStack;
        };

        // Gets actions (with their args) in redo stack
        _instance.getRedoStack = function () {
            return redoStack;
        };


        var lastMouseDownNodeInfo = null;
        var isDragDropSet = false;

        function setDragUndo(undoable) {
            isDragDropSet = true;
            cy.on("grab", "node", function () {
                if (typeof undoable === 'function' ? undoable.call(this) : undoable) {
                    lastMouseDownNodeInfo = {};
                    lastMouseDownNodeInfo.lastMouseDownPosition = {
                        x: this.position("x"),
                        y: this.position("y")
                    };
                    lastMouseDownNodeInfo.lastPaddingsMap = getPaddingsMap();
                    lastMouseDownNodeInfo.node = this;
                }
            });
            cy.on("free", "node", function () {
                if (typeof undoable === 'function' ? undoable.call(this) : undoable) {
                    if (lastMouseDownNodeInfo == null) {
                        return;
                    }
                    var node = lastMouseDownNodeInfo.node;
                    var lastMouseDownPosition = lastMouseDownNodeInfo.lastMouseDownPosition;
                    var mouseUpPosition = {
                        x: node.position("x"),
                        y: node.position("y")
                    };
                    if (mouseUpPosition.x != lastMouseDownPosition.x ||
                        mouseUpPosition.y != lastMouseDownPosition.y) {
                        var positionDiff = {
                            x: mouseUpPosition.x - lastMouseDownPosition.x,
                            y: mouseUpPosition.y - lastMouseDownPosition.y
                        };

                        var nodes;
                        if (node.selected()) {
                            nodes = cy.nodes(":visible").filter(":selected");
                        }
                        else {
                            nodes = cy.collection([node]);
                        }

                        var param = {
                            positionDiff: positionDiff,
                            nodes: nodes, move: false,
                            paddingsToReturn: lastMouseDownNodeInfo.lastPaddingsMap
                        };
                        _instance.do("drag", param);

                        lastMouseDownNodeInfo = null;
                    }
                }
            });
        }
        
        // Map the paddings of the nodes and return that map
        function getPaddingsMap() {
          var paddingsMap = {};
          var compounds = cy.nodes(':parent');
          
          compounds.each(function(i, ele){
            var paddings = {
              top: ele.css('padding-top'),
              bottom: ele.css('padding-bottom'),
              left: ele.css('padding-left'),
              right: ele.css('padding-right')
            };

            paddingsMap[ele.id()] = paddings;
          });
          
          return paddingsMap;
        }
        
        // Return to the paddings in the parameter
        function returnToPaddings(paddingsMap) {
          var compounds = cy.nodes(':parent');
          
          cy.startBatch();
          
          compounds.each(function(i, ele){
            var paddings = paddingsMap[ele.id()];
            ele.css('padding-left', paddings.left);
            ele.css('padding-right', paddings.right);
            ele.css('padding-top', paddings.top);
            ele.css('padding-bottom', paddings.bottom);
          });
          
          cy.endBatch();
        }
        
        function getTopMostNodes(nodes) {
            var nodesMap = {};
            for (var i = 0; i < nodes.length; i++) {
                nodesMap[nodes[i].id()] = true;
            }
            var roots = nodes.filter(function (i, ele) {
                var parent = ele.parent()[0];
                while(parent != null){
                    if(nodesMap[parent.id()]){
                        return false;
                    }
                    parent = parent.parent()[0];
                }
                return true;
            });

            return roots;
        }

        function moveNodes(positionDiff, nodes, notCalcTopMostNodes) {
            var topMostNodes = notCalcTopMostNodes?nodes:getTopMostNodes(nodes);
            for (var i = 0; i < topMostNodes.length; i++) {
                var node = topMostNodes[i];
                var oldX = node.position("x");
                var oldY = node.position("y");
                node.position({
                    x: oldX + positionDiff.x,
                    y: oldY + positionDiff.y
                });
                var children = node.children();
                moveNodes(positionDiff, children, true);
            }
        }

        function getEles(_eles) {
            return (typeof _eles === "string") ? cy.$(_eles) : _eles;
        }

        function restoreEles(_eles) {
            return getEles(_eles).restore();
        }


        function returnToPositionsAndSizes(nodesData) {
            var currentPositionsAndSizes = {};
            cy.nodes().positions(function (i, ele) {
                currentPositionsAndSizes[ele.id()] = {
                    width: ele.width(),
                    height: ele.height(),
                    x: ele.position("x"),
                    y: ele.position("y")
                };
                var data = nodesData[ele.id()];
                ele._private.data.width = data.width;
                ele._private.data.height = data.height;
                return {
                    x: data.x,
                    y: data.y
                };
            });

            return currentPositionsAndSizes;
        }

        function getNodesData() {
            var nodesData = {};
            var nodes = cy.nodes();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                nodesData[node.id()] = {
                    width: node.width(),
                    height: node.height(),
                    x: node.position("x"),
                    y: node.position("y")
                };
            }
            return nodesData;
        }
        
        function changeParent(param) {
          var result = {
          };

          var nodes = param.nodes;

          var transferedNodeMap = {};

          // Map the nodes included in the original node list
          for (var i = 0; i < param.nodes.length; i++) {
            var node = param.nodes[i];
            transferedNodeMap[node.id()] = true;
          }

          if (!param.firstTime) {
            // If it is not the first time get the updated nodes
            nodes = cy.nodes().filter(function (i, ele) {
              return (transferedNodeMap[ele.id()]);
            });
          }

          result.posDiffX = -1 * param.posDiffX;
          result.posDiffY = -1 * param.posDiffY;

          result.parentData = {}; // For undo / redo cases it keeps the previous parent info per node

          // Fill parent data
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            result.parentData[node.id()] = node.data('parent');
          }

          var newParentId;

          if (param.firstTime) {
            newParentId = param.parentData == undefined ? null : param.parentData;
            nodes.move({"parent": newParentId});
          }
          else {
            for (var i = 0; i < nodes.length; i++) {
              var node = nodes[i];

              newParentId = param.parentData[node.id()] == undefined ? null : param.parentData[node.id()];
              node.move({"parent": newParentId});
            }
          }

          var posDiff = {
            x: param.posDiffX,
            y: param.posDiffY
          };

          // We should get the updated nodes to move them
          result.nodes = cy.nodes().filter(function (i, ele) {
            return (transferedNodeMap[ele.id()]);
          });

          moveNodes(posDiff, result.nodes);

          return result;
        }

        // Default actions
        function defaultActions() {
            return {
                "add": {
                    _do: function (eles) {
                        return eles.firstTime ? cy.add(eles) : restoreEles(eles);
                    },
                    _undo: cy.remove
                },
                "remove": {
                    _do: cy.remove,
                    _undo: restoreEles
                },
                "restore": {
                    _do: restoreEles,
                    _undo: cy.remove
                },
                "select": {
                    _do: function (_eles) {
                        return getEles(_eles).select();
                    },
                    _undo: function (_eles) {
                        return getEles(_eles).unselect();
                    }
                },
                "unselect": {
                    _do: function (_eles) {
                        return getEles(_eles).unselect();
                    },
                    _undo: function (_eles) {
                        return getEles(_eles).select();
                    }
                },
                "move": {
                    _do: function (args) {
                        var eles = getEles(args.eles);
                        var nodes = eles.nodes();
                        var edges = eles.edges();

                        return {
                            oldNodes: nodes,
                            newNodes: nodes.move(args.location),
                            oldEdges: edges,
                            newEdges: edges.move(args.location)
                        };
                    },
                    _undo: function (eles) {
                        var newEles = cy.collection();
                        var location = {};
                        if (eles.newNodes.length > 0) {
                            location.parent = eles.newNodes[0].parent();

                            for (var i = 0; i < eles.newNodes.length; i++) {
                                var newNode = eles.newNodes[i].move({
                                    parent: eles.oldNodes[i].parent()
                                });
                                newEles.union(newNode);
                            }
                        } else {
                            location.source = location.newEdges[0].source();
                            location.target = location.newEdges[0].target();

                            for (var i = 0; i < eles.newEdges.length; i++) {
                                var newEdge = eles.newEdges[i].move({
                                    source: eles.oldEdges[i].source(),
                                    target: eles.oldEdges[i].target()
                                });
                                newEles.union(newEdge);
                            }
                        }
                        return {
                            eles: newEles,
                            location: location
                        };
                    }
                },
                "drag": {
                    _do: function (args) {
                        if (args.move)
                            moveNodes(args.positionDiff, args.nodes);
                        return args;
                    },
                    _undo: function (args) {
                        var diff = {
                            x: -1 * args.positionDiff.x,
                            y: -1 * args.positionDiff.y
                        };
                        var result = {
                            positionDiff: args.positionDiff,
                            nodes: args.nodes,
                            move: true
                        };
                        moveNodes(diff, args.nodes);
                        return result;
                    }
                },
                "layout": {
                    _do: function (args) {
                        if (args.firstTime){
                            var nodesData = getNodesData();
                            if(args.eles)
                                getEles(args.eles).layout(args.options);
                            else
                              cy.layout(args.options);
                            return nodesData;
                        } else
                            return returnToPositionsAndSizes(args.options);
                    },
                    _undo: function (nodesData) {
                        return returnToPositionsAndSizes(nodesData);
                    }
                },
                "changeParent": {
                    _do: function (args) {
                        return changeParent(args);
                    },
                    _undo: function (args) {
                        return changeParent(args);
                    }
                }
            };
        }

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape.js-undo-redo', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape);
    }

})();
