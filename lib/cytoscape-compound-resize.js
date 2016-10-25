(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeCompoundResize = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var compoundResizeUtilities = function (cy, mode) {
  var scratchUtilities = _dereq_("./scratchUtilities")();

  var self = {
    setMode: function(newmode) {
      if(newmode == mode) {
        return;
      }
      
      var compounds = cy.nodes('$node > node');
      
      // If the new mode is 'free' set the paddings to the minimums before setting the mode if minimum paddings exists
      if (newmode === 'free') {
        compounds.each(function (i, ele) {
          var minPaddings = self.getMinimumPaddings(ele);
          
          if (!minPaddings) {
            return;
          }

          ele.css('padding-top', minPaddings.top);
          ele.css('padding-bottom', minPaddings.bottom);
          ele.css('padding-left', minPaddings.left);
          ele.css('padding-right', minPaddings.right);
        });
      }
      
      mode = newmode; // Set the new mode
      
      // If the new mode is 'min' set the minimum and maximum paddings after setting the new mode
      if (newmode === 'min') {
        compounds.each(function (i, ele) {
          var paddings = {
            'top': ele.css('padding-top'),
            'bottom': ele.css('padding-bottom'),
            'left': ele.css('padding-left'),
            'right': ele.css('padding-right')
          };

          self.setExtremePaddings(ele, paddings, 'min', true);
          self.setExtremePaddings(ele, paddings, 'max', true);
        });
      }
    },
    getMode: function() {
      return mode;
    },
    setPaddings: function (nodes, paddings) {
      
      if (mode !== 'min') {
        return;
      }
      
      cy.startBatch();

      nodes.each(function (i, ele) {
        var minPaddings = self.getMinimumPaddings(ele);
        var maxPaddings = self.getMaximumPaddings(ele);

        if ( paddings.left >= minPaddings.left && paddings.left <= maxPaddings.left ) {
          ele.css('padding-left', paddings.left);
        }

        if ( paddings.right >= minPaddings.right && paddings.right <= maxPaddings.right ) {
          ele.css('padding-right', paddings.right);
        }

        if ( paddings.top >= minPaddings.top && paddings.top <= maxPaddings.top ) {
          ele.css('padding-top', paddings.top);
        }

        if ( paddings.bottom >= minPaddings.bottom && paddings.bottom <= maxPaddings.bottom ) {
          ele.css('padding-bottom', paddings.bottom);
        }
      });
      
      cy.endBatch();
    },
    // Set extreme paddings of the nodes use force parameter if you do not need to satisfy 'minPaddings <= maxPaddings' rule
    setExtremePaddings: function (nodes, _paddings, minOrMax, force) {
      if (mode !== 'min') {
        return;
      }
      
      cy.startBatch();

      nodes.each(function (i, ele) {
        var paddingLeft = parseFloat(ele.css('padding-left'));
        var paddingRight = parseFloat(ele.css('padding-right'));
        var paddingTop = parseFloat(ele.css('padding-top'));
        var paddingBottom = parseFloat(ele.css('padding-bottom'));

        var minPaddings = self.getMinimumPaddings(ele);
        var maxPaddings = self.getMaximumPaddings(ele);
        
        // Get the extreme paddings to set them
        var extremePaddings = minOrMax === 'min' ? minPaddings : maxPaddings;

        var sign = minOrMax === 'min' ? 1 : -1;
        
        // Clone _paddings into paddings object
        var paddings = {
        };
        
        // Filter paddings from _paddings note that the rule of 'maxPaddings >= minPaddings' should be satisfied
        if (minOrMax === 'min') {
          for (var prop in _paddings) {
            if (force || _paddings[prop] <= maxPaddings[prop]) {
              paddings[prop] = _paddings[prop];
            }
          }
        }
        else if (minOrMax === 'max') {
          for (var prop in _paddings) {
            if (force || _paddings[prop] >= minPaddings[prop]) {
              paddings[prop] = _paddings[prop];
            }
          }
        }

        // Set the extreme paddings where applicable
        if (paddings.left) {
          if (paddingLeft * sign < paddings.left * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-left', paddings.left);
          }

          extremePaddings.left = parseFloat(paddings.left);
        }

        if (paddings.right) {
          if (paddingRight * sign < paddings.right * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-right', paddings.right);
          }

          extremePaddings.right = parseFloat(paddings.right);
        }

        if (paddings.top) {
          if (paddingTop * sign < paddings.top * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-top', paddings.top);
          }

          extremePaddings.top = parseFloat(paddings.top);
        }

        if (paddings.bottom) {
          if (paddingBottom * sign < paddings.bottom * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-bottom', paddings.bottom);
          }

          extremePaddings.bottom = parseFloat(paddings.bottom);
        }
      });

      cy.endBatch();
    },
    getMinimumPaddings: function (node) {
      if (mode !== 'min') {
        return null;
      }
      
      var paddings = scratchUtilities.getScratch(node).minPaddings;
      if (!paddings) {
        paddings = scratchUtilities.getScratch(node).minPaddings = {};
      }
      return paddings;
    },
    getMaximumPaddings: function (node) {
      if (mode !== 'min') {
        return null;
      }
      
      var paddings = scratchUtilities.getScratch(node).maxPaddings;
      if (!paddings) {
        paddings = scratchUtilities.getScratch(node).maxPaddings = {};
      }
      return paddings;
    }
  };

  return self;
};

module.exports = compoundResizeUtilities;
},{"./scratchUtilities":4}],2:[function(_dereq_,module,exports){
var elementUtilities = function () {
  return {
    //this method returns the nodes non of whose ancestors is not in given nodes
    getTopMostNodes: function (nodes) {
      var nodesMap = {};
      for (var i = 0; i < nodes.length; i++) {
        nodesMap[nodes[i].id()] = true;
      }
      var roots = nodes.filter(function (i, ele) {
        var parent = ele.parent()[0];
        while (parent != null) {
          if (nodesMap[parent.id()]) {
            return false;
          }
          parent = parent.parent()[0];
        }
        return true;
      });

      return roots;
    },
    // Get the corner positions of the node
    getOuterCornerPositions: function(node) {
      var posX = node.position('x');
      var posY = node.position('y');
      var halfWidth = node.width() / 2;
      var halfHeight = node.height() / 2;
      
      return {
        'top': posY - halfHeight,
        'bottom': posY + halfHeight,
        'left': posX - halfWidth,
        'right': posX + halfWidth
      };
    }
  };
};

module.exports = elementUtilities;
},{}],3:[function(_dereq_,module,exports){
;
(function () {
  'use strict';
  var elementUtilities = _dereq_("./elementUtilities")();
  var compoundResizeUtilities;
  var mode;
  
  // Event functions
  var tapStartFcn, dragFcn, resizeStartFcn, resizeDragFcn, resizeEndFcn;

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    var unbindEvents = function (cy) {
      cy.off('node', tapStartFcn);
      cy.off(dragFcn);
      cy.off(resizeStartFcn);
      cy.off(resizeDragFcn);
      cy.off(resizeEndFcn);
    };

    var bindEvents = function (cy) {
      var ancestorsCornerPositions;
      var effectedNodes;
      var ancestorMap;

      // Fill the data of elements which will be affected by the respositioning 
      var fillEffectedData = function (fillAncestorsMap) {
        ancestorsCornerPositions = [];

        if (fillAncestorsMap) {
          ancestorMap = {};
        }

        effectedNodes.each(function (i, ele) {
          var corners = []; // It will be used like a queue
          var currentAncestor = ele.parent()[0];

          while (currentAncestor) {
            var id = currentAncestor.id();

            var corner = elementUtilities.getOuterCornerPositions(currentAncestor);
            corner.id = id;

            corners.push(corner);

            if (fillAncestorsMap && !ancestorMap[id]) {
              ancestorMap[id] = currentAncestor;
            }

            currentAncestor = currentAncestor.parent()[0];
          }

          ancestorsCornerPositions.push(corners);
        });
      };

      // Update the paddings according to the movement
      var updatePaddings = function () {
        // Keeps the already processed ancestors
        var processedAncestors = {};

        ancestorsCornerPositions.forEach(function (element, index, array) {
          var cornersQueue = element;
          while (cornersQueue.length > 0) {
            var oldCorners = cornersQueue.shift();

            if (processedAncestors[cornersQueue.id]) {
              continue;
            }

            processedAncestors[oldCorners.id] = true;
            var ancestor = ancestorMap[oldCorners.id];
            var currentCorners = elementUtilities.getOuterCornerPositions(ancestor);

            if (currentCorners.top === oldCorners.top && currentCorners.bottom === oldCorners.bottom
                    && currentCorners.left === oldCorners.left && currentCorners.right === oldCorners.right) {
              break;
            }

            var paddingTop, paddingBottom, paddingLeft, paddingRight;

            var topDiff = currentCorners.top - oldCorners.top;

            if (topDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-top'));
              paddingTop = currentPadding + topDiff;
            }

            var bottomDiff = currentCorners.bottom - oldCorners.bottom;

            if (bottomDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-bottom'));
              paddingBottom = currentPadding - bottomDiff;
            }

            var leftDiff = currentCorners.left - oldCorners.left;

            if (leftDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-left'));
              paddingLeft = currentPadding + leftDiff;
            }

            var rightDiff = currentCorners.right - oldCorners.right;

            if (rightDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-right'));
              paddingRight = currentPadding - rightDiff;
            }

            if (!paddingTop && !paddingBottom && !paddingLeft && !paddingRight) {
              continue;
            }

            var paddings = {};

            if (paddingTop) {
              paddings.top = paddingTop;
            }

            if (paddingBottom) {
              paddings.bottom = paddingBottom;
            }

            if (paddingLeft) {
              paddings.left = paddingLeft;
            }

            if (paddingRight) {
              paddings.right = paddingRight;
            }

            compoundResizeUtilities.setPaddings(ancestor, paddings);
          }
        });
      };
      
      var resizing; // A flag indicating if any node is being resized

      cy.on('tapstart', 'node', tapStartFcn = function () {
        // If the mode is not 'min' or any node is being resized return directly
        if( mode !== 'min' || resizing ) {
          return;
        }
        
        var node = this;

        if (node.selected()) {
          effectedNodes = cy.nodes(':selected').difference(node.ancestors());
        }
        else {
          effectedNodes = cy.collection().add(node);
        }

        // We care about the movement of top most nodes
        effectedNodes = elementUtilities.getTopMostNodes(effectedNodes);

        fillEffectedData(true);
      });

      cy.on('drag', 'node', dragFcn = function () {
        if( mode !== 'min' ) {
          return;
        }
        
        updatePaddings();
        fillEffectedData(false);
      });

      cy.on('resizestart', resizeStartFcn = function (e, type, nodes) {
        resizing = true; // Set the 'resizing' flag 
        
        if( mode !== 'min' ) {
          return;
        }
        
        effectedNodes = nodes;
        fillEffectedData(true);
      });

      cy.on('resizedrag', resizeDragFcn = function (e, type, nodes) {
        if( mode !== 'min' ) {
          return;
        }
        
        updatePaddings();
        fillEffectedData(false);
      });
      
      cy.on('resizeend', resizeEndFcn = function (e, type, nodes) {
        resizing = undefined; // Unset the 'resizing' flag
      });
    };

    cytoscape('core', 'compoundResize', function (_mode) {
      var cy = this;
      
      if (_mode === 'destroy') {
        unbindEvents(cy);
        return;
      }
      
      if( _mode != 'get' ) {
        compoundResizeUtilities = _dereq_('./compoundResizeUtilities')(cy);
        mode = _mode;
        compoundResizeUtilities.setMode(mode);
        bindEvents(cy);
      }

      return compoundResizeUtilities; // Provide API
    });

  };

  if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = register;
  }

  if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
    define('cytoscape-compound-resize', function () {
      return register;
    });
  }

  if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
    register(cytoscape);
  }

})();

},{"./compoundResizeUtilities":1,"./elementUtilities":2}],4:[function(_dereq_,module,exports){
var scratchUtilities = function () {
  return {
    getScratch: function (cyOrEle) {
      if (!cyOrEle.scratch('_compoundResize')) {
        cyOrEle.scratch('_compoundResize', {});
      }
      return cyOrEle.scratch('_compoundResize');
    }
  };
};

module.exports = scratchUtilities;
},{}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG91bmRSZXNpemVVdGlsaXRpZXMuanMiLCJzcmMvZWxlbWVudFV0aWxpdGllcy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JhdGNoVXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY29tcG91bmRSZXNpemVVdGlsaXRpZXMgPSBmdW5jdGlvbiAoY3ksIG1vZGUpIHtcbiAgdmFyIHNjcmF0Y2hVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi9zY3JhdGNoVXRpbGl0aWVzXCIpKCk7XG5cbiAgdmFyIHNlbGYgPSB7XG4gICAgc2V0TW9kZTogZnVuY3Rpb24obmV3bW9kZSkge1xuICAgICAgaWYobmV3bW9kZSA9PSBtb2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIGNvbXBvdW5kcyA9IGN5Lm5vZGVzKCckbm9kZSA+IG5vZGUnKTtcbiAgICAgIFxuICAgICAgLy8gSWYgdGhlIG5ldyBtb2RlIGlzICdmcmVlJyBzZXQgdGhlIHBhZGRpbmdzIHRvIHRoZSBtaW5pbXVtcyBiZWZvcmUgc2V0dGluZyB0aGUgbW9kZSBpZiBtaW5pbXVtIHBhZGRpbmdzIGV4aXN0c1xuICAgICAgaWYgKG5ld21vZGUgPT09ICdmcmVlJykge1xuICAgICAgICBjb21wb3VuZHMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgICAgdmFyIG1pblBhZGRpbmdzID0gc2VsZi5nZXRNaW5pbXVtUGFkZGluZ3MoZWxlKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIW1pblBhZGRpbmdzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy10b3AnLCBtaW5QYWRkaW5ncy50b3ApO1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJywgbWluUGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBtaW5QYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JywgbWluUGFkZGluZ3MucmlnaHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgbW9kZSA9IG5ld21vZGU7IC8vIFNldCB0aGUgbmV3IG1vZGVcbiAgICAgIFxuICAgICAgLy8gSWYgdGhlIG5ldyBtb2RlIGlzICdtaW4nIHNldCB0aGUgbWluaW11bSBhbmQgbWF4aW11bSBwYWRkaW5ncyBhZnRlciBzZXR0aW5nIHRoZSBuZXcgbW9kZVxuICAgICAgaWYgKG5ld21vZGUgPT09ICdtaW4nKSB7XG4gICAgICAgIGNvbXBvdW5kcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICB2YXIgcGFkZGluZ3MgPSB7XG4gICAgICAgICAgICAndG9wJzogZWxlLmNzcygncGFkZGluZy10b3AnKSxcbiAgICAgICAgICAgICdib3R0b20nOiBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpLFxuICAgICAgICAgICAgJ2xlZnQnOiBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnKSxcbiAgICAgICAgICAgICdyaWdodCc6IGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnKVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzZWxmLnNldEV4dHJlbWVQYWRkaW5ncyhlbGUsIHBhZGRpbmdzLCAnbWluJywgdHJ1ZSk7XG4gICAgICAgICAgc2VsZi5zZXRFeHRyZW1lUGFkZGluZ3MoZWxlLCBwYWRkaW5ncywgJ21heCcsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG1vZGU7XG4gICAgfSxcbiAgICBzZXRQYWRkaW5nczogZnVuY3Rpb24gKG5vZGVzLCBwYWRkaW5ncykge1xuICAgICAgXG4gICAgICBpZiAobW9kZSAhPT0gJ21pbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjeS5zdGFydEJhdGNoKCk7XG5cbiAgICAgIG5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICB2YXIgbWF4UGFkZGluZ3MgPSBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgIGlmICggcGFkZGluZ3MubGVmdCA+PSBtaW5QYWRkaW5ncy5sZWZ0ICYmIHBhZGRpbmdzLmxlZnQgPD0gbWF4UGFkZGluZ3MubGVmdCApIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGFkZGluZ3MucmlnaHQgPj0gbWluUGFkZGluZ3MucmlnaHQgJiYgcGFkZGluZ3MucmlnaHQgPD0gbWF4UGFkZGluZ3MucmlnaHQgKSB7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1yaWdodCcsIHBhZGRpbmdzLnJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGFkZGluZ3MudG9wID49IG1pblBhZGRpbmdzLnRvcCAmJiBwYWRkaW5ncy50b3AgPD0gbWF4UGFkZGluZ3MudG9wICkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGFkZGluZ3MuYm90dG9tID49IG1pblBhZGRpbmdzLmJvdHRvbSAmJiBwYWRkaW5ncy5ib3R0b20gPD0gbWF4UGFkZGluZ3MuYm90dG9tICkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJywgcGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGN5LmVuZEJhdGNoKCk7XG4gICAgfSxcbiAgICAvLyBTZXQgZXh0cmVtZSBwYWRkaW5ncyBvZiB0aGUgbm9kZXMgdXNlIGZvcmNlIHBhcmFtZXRlciBpZiB5b3UgZG8gbm90IG5lZWQgdG8gc2F0aXNmeSAnbWluUGFkZGluZ3MgPD0gbWF4UGFkZGluZ3MnIHJ1bGVcbiAgICBzZXRFeHRyZW1lUGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlcywgX3BhZGRpbmdzLCBtaW5Pck1heCwgZm9yY2UpIHtcbiAgICAgIGlmIChtb2RlICE9PSAnbWluJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIGN5LnN0YXJ0QmF0Y2goKTtcblxuICAgICAgbm9kZXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlRmxvYXQoZWxlLmNzcygncGFkZGluZy1sZWZ0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VGbG9hdChlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlRmxvYXQoZWxlLmNzcygncGFkZGluZy10b3AnKSk7XG4gICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpKTtcblxuICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICB2YXIgbWF4UGFkZGluZ3MgPSBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRoZSBleHRyZW1lIHBhZGRpbmdzIHRvIHNldCB0aGVtXG4gICAgICAgIHZhciBleHRyZW1lUGFkZGluZ3MgPSBtaW5Pck1heCA9PT0gJ21pbicgPyBtaW5QYWRkaW5ncyA6IG1heFBhZGRpbmdzO1xuXG4gICAgICAgIHZhciBzaWduID0gbWluT3JNYXggPT09ICdtaW4nID8gMSA6IC0xO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2xvbmUgX3BhZGRpbmdzIGludG8gcGFkZGluZ3Mgb2JqZWN0XG4gICAgICAgIHZhciBwYWRkaW5ncyA9IHtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZpbHRlciBwYWRkaW5ncyBmcm9tIF9wYWRkaW5ncyBub3RlIHRoYXQgdGhlIHJ1bGUgb2YgJ21heFBhZGRpbmdzID49IG1pblBhZGRpbmdzJyBzaG91bGQgYmUgc2F0aXNmaWVkXG4gICAgICAgIGlmIChtaW5Pck1heCA9PT0gJ21pbicpIHtcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIF9wYWRkaW5ncykge1xuICAgICAgICAgICAgaWYgKGZvcmNlIHx8IF9wYWRkaW5nc1twcm9wXSA8PSBtYXhQYWRkaW5nc1twcm9wXSkge1xuICAgICAgICAgICAgICBwYWRkaW5nc1twcm9wXSA9IF9wYWRkaW5nc1twcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluT3JNYXggPT09ICdtYXgnKSB7XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBfcGFkZGluZ3MpIHtcbiAgICAgICAgICAgIGlmIChmb3JjZSB8fCBfcGFkZGluZ3NbcHJvcF0gPj0gbWluUGFkZGluZ3NbcHJvcF0pIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3NbcHJvcF0gPSBfcGFkZGluZ3NbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBleHRyZW1lIHBhZGRpbmdzIHdoZXJlIGFwcGxpY2FibGVcbiAgICAgICAgaWYgKHBhZGRpbmdzLmxlZnQpIHtcbiAgICAgICAgICBpZiAocGFkZGluZ0xlZnQgKiBzaWduIDwgcGFkZGluZ3MubGVmdCAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MubGVmdCA9IHBhcnNlRmxvYXQocGFkZGluZ3MubGVmdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MucmlnaHQpIHtcbiAgICAgICAgICBpZiAocGFkZGluZ1JpZ2h0ICogc2lnbiA8IHBhZGRpbmdzLnJpZ2h0ICogc2lnbikge1xuICAgICAgICAgICAgLy8gUGFkZGluZ3MgY2Fubm90IGJlIHNtYWxsZXIgdGhlbiBtaW4gcGFkZGluZ3MgYW5kIGNhbm5vdCBiZSBiaWdnZXIgdGhlbiBtYXggcGFkZGluZ3NcbiAgICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLnJpZ2h0ID0gcGFyc2VGbG9hdChwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MudG9wKSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdUb3AgKiBzaWduIDwgcGFkZGluZ3MudG9wICogc2lnbikge1xuICAgICAgICAgICAgLy8gUGFkZGluZ3MgY2Fubm90IGJlIHNtYWxsZXIgdGhlbiBtaW4gcGFkZGluZ3MgYW5kIGNhbm5vdCBiZSBiaWdnZXIgdGhlbiBtYXggcGFkZGluZ3NcbiAgICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MudG9wID0gcGFyc2VGbG9hdChwYWRkaW5ncy50b3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLmJvdHRvbSkge1xuICAgICAgICAgIGlmIChwYWRkaW5nQm90dG9tICogc2lnbiA8IHBhZGRpbmdzLmJvdHRvbSAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLmJvdHRvbSA9IHBhcnNlRmxvYXQocGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGN5LmVuZEJhdGNoKCk7XG4gICAgfSxcbiAgICBnZXRNaW5pbXVtUGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBpZiAobW9kZSAhPT0gJ21pbicpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5taW5QYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWluUGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9LFxuICAgIGdldE1heGltdW1QYWRkaW5nczogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChtb2RlICE9PSAnbWluJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIHBhZGRpbmdzID0gc2NyYXRjaFV0aWxpdGllcy5nZXRTY3JhdGNoKG5vZGUpLm1heFBhZGRpbmdzO1xuICAgICAgaWYgKCFwYWRkaW5ncykge1xuICAgICAgICBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5tYXhQYWRkaW5ncyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhZGRpbmdzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY29tcG91bmRSZXNpemVVdGlsaXRpZXM7IiwidmFyIGVsZW1lbnRVdGlsaXRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgLy90aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBub2RlcyBub24gb2Ygd2hvc2UgYW5jZXN0b3JzIGlzIG5vdCBpbiBnaXZlbiBub2Rlc1xuICAgIGdldFRvcE1vc3ROb2RlczogZnVuY3Rpb24gKG5vZGVzKSB7XG4gICAgICB2YXIgbm9kZXNNYXAgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm9kZXNNYXBbbm9kZXNbaV0uaWQoKV0gPSB0cnVlO1xuICAgICAgfVxuICAgICAgdmFyIHJvb3RzID0gbm9kZXMuZmlsdGVyKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZS5wYXJlbnQoKVswXTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKG5vZGVzTWFwW3BhcmVudC5pZCgpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50KClbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJvb3RzO1xuICAgIH0sXG4gICAgLy8gR2V0IHRoZSBjb3JuZXIgcG9zaXRpb25zIG9mIHRoZSBub2RlXG4gICAgZ2V0T3V0ZXJDb3JuZXJQb3NpdGlvbnM6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHZhciBwb3NYID0gbm9kZS5wb3NpdGlvbigneCcpO1xuICAgICAgdmFyIHBvc1kgPSBub2RlLnBvc2l0aW9uKCd5Jyk7XG4gICAgICB2YXIgaGFsZldpZHRoID0gbm9kZS53aWR0aCgpIC8gMjtcbiAgICAgIHZhciBoYWxmSGVpZ2h0ID0gbm9kZS5oZWlnaHQoKSAvIDI7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd0b3AnOiBwb3NZIC0gaGFsZkhlaWdodCxcbiAgICAgICAgJ2JvdHRvbSc6IHBvc1kgKyBoYWxmSGVpZ2h0LFxuICAgICAgICAnbGVmdCc6IHBvc1ggLSBoYWxmV2lkdGgsXG4gICAgICAgICdyaWdodCc6IHBvc1ggKyBoYWxmV2lkdGhcbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlbGVtZW50VXRpbGl0aWVzOyIsIjtcbihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGVsZW1lbnRVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi9lbGVtZW50VXRpbGl0aWVzXCIpKCk7XG4gIHZhciBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcztcbiAgdmFyIG1vZGU7XG4gIFxuICAvLyBFdmVudCBmdW5jdGlvbnNcbiAgdmFyIHRhcFN0YXJ0RmNuLCBkcmFnRmNuLCByZXNpemVTdGFydEZjbiwgcmVzaXplRHJhZ0ZjbiwgcmVzaXplRW5kRmNuO1xuXG4gIC8vIHJlZ2lzdGVycyB0aGUgZXh0ZW5zaW9uIG9uIGEgY3l0b3NjYXBlIGxpYiByZWZcbiAgdmFyIHJlZ2lzdGVyID0gZnVuY3Rpb24gKGN5dG9zY2FwZSkge1xuXG4gICAgaWYgKCFjeXRvc2NhcGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIGNhbid0IHJlZ2lzdGVyIGlmIGN5dG9zY2FwZSB1bnNwZWNpZmllZFxuXG4gICAgdmFyIHVuYmluZEV2ZW50cyA9IGZ1bmN0aW9uIChjeSkge1xuICAgICAgY3kub2ZmKCdub2RlJywgdGFwU3RhcnRGY24pO1xuICAgICAgY3kub2ZmKGRyYWdGY24pO1xuICAgICAgY3kub2ZmKHJlc2l6ZVN0YXJ0RmNuKTtcbiAgICAgIGN5Lm9mZihyZXNpemVEcmFnRmNuKTtcbiAgICAgIGN5Lm9mZihyZXNpemVFbmRGY24pO1xuICAgIH07XG5cbiAgICB2YXIgYmluZEV2ZW50cyA9IGZ1bmN0aW9uIChjeSkge1xuICAgICAgdmFyIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucztcbiAgICAgIHZhciBlZmZlY3RlZE5vZGVzO1xuICAgICAgdmFyIGFuY2VzdG9yTWFwO1xuXG4gICAgICAvLyBGaWxsIHRoZSBkYXRhIG9mIGVsZW1lbnRzIHdoaWNoIHdpbGwgYmUgYWZmZWN0ZWQgYnkgdGhlIHJlc3Bvc2l0aW9uaW5nIFxuICAgICAgdmFyIGZpbGxFZmZlY3RlZERhdGEgPSBmdW5jdGlvbiAoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMgPSBbXTtcblxuICAgICAgICBpZiAoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICAgIGFuY2VzdG9yTWFwID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBlZmZlY3RlZE5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBjb3JuZXJzID0gW107IC8vIEl0IHdpbGwgYmUgdXNlZCBsaWtlIGEgcXVldWVcbiAgICAgICAgICB2YXIgY3VycmVudEFuY2VzdG9yID0gZWxlLnBhcmVudCgpWzBdO1xuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3Rvcikge1xuICAgICAgICAgICAgdmFyIGlkID0gY3VycmVudEFuY2VzdG9yLmlkKCk7XG5cbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBlbGVtZW50VXRpbGl0aWVzLmdldE91dGVyQ29ybmVyUG9zaXRpb25zKGN1cnJlbnRBbmNlc3Rvcik7XG4gICAgICAgICAgICBjb3JuZXIuaWQgPSBpZDtcblxuICAgICAgICAgICAgY29ybmVycy5wdXNoKGNvcm5lcik7XG5cbiAgICAgICAgICAgIGlmIChmaWxsQW5jZXN0b3JzTWFwICYmICFhbmNlc3Rvck1hcFtpZF0pIHtcbiAgICAgICAgICAgICAgYW5jZXN0b3JNYXBbaWRdID0gY3VycmVudEFuY2VzdG9yO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50QW5jZXN0b3IgPSBjdXJyZW50QW5jZXN0b3IucGFyZW50KClbMF07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYW5jZXN0b3JzQ29ybmVyUG9zaXRpb25zLnB1c2goY29ybmVycyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwYWRkaW5ncyBhY2NvcmRpbmcgdG8gdGhlIG1vdmVtZW50XG4gICAgICB2YXIgdXBkYXRlUGFkZGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIEtlZXBzIHRoZSBhbHJlYWR5IHByb2Nlc3NlZCBhbmNlc3RvcnNcbiAgICAgICAgdmFyIHByb2Nlc3NlZEFuY2VzdG9ycyA9IHt9O1xuXG4gICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50LCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgICB2YXIgY29ybmVyc1F1ZXVlID0gZWxlbWVudDtcbiAgICAgICAgICB3aGlsZSAoY29ybmVyc1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBvbGRDb3JuZXJzID0gY29ybmVyc1F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzZWRBbmNlc3RvcnNbY29ybmVyc1F1ZXVlLmlkXSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvY2Vzc2VkQW5jZXN0b3JzW29sZENvcm5lcnMuaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBhbmNlc3RvciA9IGFuY2VzdG9yTWFwW29sZENvcm5lcnMuaWRdO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb3JuZXJzID0gZWxlbWVudFV0aWxpdGllcy5nZXRPdXRlckNvcm5lclBvc2l0aW9ucyhhbmNlc3Rvcik7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50Q29ybmVycy50b3AgPT09IG9sZENvcm5lcnMudG9wICYmIGN1cnJlbnRDb3JuZXJzLmJvdHRvbSA9PT0gb2xkQ29ybmVycy5ib3R0b21cbiAgICAgICAgICAgICAgICAgICAgJiYgY3VycmVudENvcm5lcnMubGVmdCA9PT0gb2xkQ29ybmVycy5sZWZ0ICYmIGN1cnJlbnRDb3JuZXJzLnJpZ2h0ID09PSBvbGRDb3JuZXJzLnJpZ2h0KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCwgcGFkZGluZ0JvdHRvbSwgcGFkZGluZ0xlZnQsIHBhZGRpbmdSaWdodDtcblxuICAgICAgICAgICAgdmFyIHRvcERpZmYgPSBjdXJyZW50Q29ybmVycy50b3AgLSBvbGRDb3JuZXJzLnRvcDtcblxuICAgICAgICAgICAgaWYgKHRvcERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy10b3AnKSk7XG4gICAgICAgICAgICAgIHBhZGRpbmdUb3AgPSBjdXJyZW50UGFkZGluZyArIHRvcERpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBib3R0b21EaWZmID0gY3VycmVudENvcm5lcnMuYm90dG9tIC0gb2xkQ29ybmVycy5ib3R0b207XG5cbiAgICAgICAgICAgIGlmIChib3R0b21EaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VGbG9hdChhbmNlc3Rvci5jc3MoJ3BhZGRpbmctYm90dG9tJykpO1xuICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tID0gY3VycmVudFBhZGRpbmcgLSBib3R0b21EaWZmO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbGVmdERpZmYgPSBjdXJyZW50Q29ybmVycy5sZWZ0IC0gb2xkQ29ybmVycy5sZWZ0O1xuXG4gICAgICAgICAgICBpZiAobGVmdERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy1sZWZ0JykpO1xuICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGN1cnJlbnRQYWRkaW5nICsgbGVmdERpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByaWdodERpZmYgPSBjdXJyZW50Q29ybmVycy5yaWdodCAtIG9sZENvcm5lcnMucmlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChyaWdodERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy1yaWdodCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gY3VycmVudFBhZGRpbmcgLSByaWdodERpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcGFkZGluZ1RvcCAmJiAhcGFkZGluZ0JvdHRvbSAmJiAhcGFkZGluZ0xlZnQgJiYgIXBhZGRpbmdSaWdodCkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhZGRpbmdzID0ge307XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nVG9wKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLnRvcCA9IHBhZGRpbmdUb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nQm90dG9tKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLmJvdHRvbSA9IHBhZGRpbmdCb3R0b207XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nTGVmdCkge1xuICAgICAgICAgICAgICBwYWRkaW5ncy5sZWZ0ID0gcGFkZGluZ0xlZnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nUmlnaHQpIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MucmlnaHQgPSBwYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldFBhZGRpbmdzKGFuY2VzdG9yLCBwYWRkaW5ncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIHZhciByZXNpemluZzsgLy8gQSBmbGFnIGluZGljYXRpbmcgaWYgYW55IG5vZGUgaXMgYmVpbmcgcmVzaXplZFxuXG4gICAgICBjeS5vbigndGFwc3RhcnQnLCAnbm9kZScsIHRhcFN0YXJ0RmNuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBJZiB0aGUgbW9kZSBpcyBub3QgJ21pbicgb3IgYW55IG5vZGUgaXMgYmVpbmcgcmVzaXplZCByZXR1cm4gZGlyZWN0bHlcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nIHx8IHJlc2l6aW5nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzO1xuXG4gICAgICAgIGlmIChub2RlLnNlbGVjdGVkKCkpIHtcbiAgICAgICAgICBlZmZlY3RlZE5vZGVzID0gY3kubm9kZXMoJzpzZWxlY3RlZCcpLmRpZmZlcmVuY2Uobm9kZS5hbmNlc3RvcnMoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWZmZWN0ZWROb2RlcyA9IGN5LmNvbGxlY3Rpb24oKS5hZGQobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBjYXJlIGFib3V0IHRoZSBtb3ZlbWVudCBvZiB0b3AgbW9zdCBub2Rlc1xuICAgICAgICBlZmZlY3RlZE5vZGVzID0gZWxlbWVudFV0aWxpdGllcy5nZXRUb3BNb3N0Tm9kZXMoZWZmZWN0ZWROb2Rlcyk7XG5cbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBjeS5vbignZHJhZycsICdub2RlJywgZHJhZ0ZjbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdXBkYXRlUGFkZGluZ3MoKTtcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YShmYWxzZSk7XG4gICAgICB9KTtcblxuICAgICAgY3kub24oJ3Jlc2l6ZXN0YXJ0JywgcmVzaXplU3RhcnRGY24gPSBmdW5jdGlvbiAoZSwgdHlwZSwgbm9kZXMpIHtcbiAgICAgICAgcmVzaXppbmcgPSB0cnVlOyAvLyBTZXQgdGhlICdyZXNpemluZycgZmxhZyBcbiAgICAgICAgXG4gICAgICAgIGlmKCBtb2RlICE9PSAnbWluJyApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGVmZmVjdGVkTm9kZXMgPSBub2RlcztcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBjeS5vbigncmVzaXplZHJhZycsIHJlc2l6ZURyYWdGY24gPSBmdW5jdGlvbiAoZSwgdHlwZSwgbm9kZXMpIHtcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdXBkYXRlUGFkZGluZ3MoKTtcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YShmYWxzZSk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgY3kub24oJ3Jlc2l6ZWVuZCcsIHJlc2l6ZUVuZEZjbiA9IGZ1bmN0aW9uIChlLCB0eXBlLCBub2Rlcykge1xuICAgICAgICByZXNpemluZyA9IHVuZGVmaW5lZDsgLy8gVW5zZXQgdGhlICdyZXNpemluZycgZmxhZ1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGN5dG9zY2FwZSgnY29yZScsICdjb21wb3VuZFJlc2l6ZScsIGZ1bmN0aW9uIChfbW9kZSkge1xuICAgICAgdmFyIGN5ID0gdGhpcztcbiAgICAgIFxuICAgICAgaWYgKF9tb2RlID09PSAnZGVzdHJveScpIHtcbiAgICAgICAgdW5iaW5kRXZlbnRzKGN5KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggX21vZGUgIT0gJ2dldCcgKSB7XG4gICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzID0gcmVxdWlyZSgnLi9jb21wb3VuZFJlc2l6ZVV0aWxpdGllcycpKGN5KTtcbiAgICAgICAgbW9kZSA9IF9tb2RlO1xuICAgICAgICBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcy5zZXRNb2RlKG1vZGUpO1xuICAgICAgICBiaW5kRXZlbnRzKGN5KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzOyAvLyBQcm92aWRlIEFQSVxuICAgIH0pO1xuXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7IC8vIGV4cG9zZSBhcyBhIGNvbW1vbmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXI7XG4gIH1cblxuICBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkgeyAvLyBleHBvc2UgYXMgYW4gYW1kL3JlcXVpcmVqcyBtb2R1bGVcbiAgICBkZWZpbmUoJ2N5dG9zY2FwZS1jb21wb3VuZC1yZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVnaXN0ZXI7XG4gICAgfSk7XG4gIH1cblxuICBpZiAodHlwZW9mIGN5dG9zY2FwZSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gZXhwb3NlIHRvIGdsb2JhbCBjeXRvc2NhcGUgKGkuZS4gd2luZG93LmN5dG9zY2FwZSlcbiAgICByZWdpc3RlcihjeXRvc2NhcGUpO1xuICB9XG5cbn0pKCk7XG4iLCJ2YXIgc2NyYXRjaFV0aWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTY3JhdGNoOiBmdW5jdGlvbiAoY3lPckVsZSkge1xuICAgICAgaWYgKCFjeU9yRWxlLnNjcmF0Y2goJ19jb21wb3VuZFJlc2l6ZScpKSB7XG4gICAgICAgIGN5T3JFbGUuc2NyYXRjaCgnX2NvbXBvdW5kUmVzaXplJywge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN5T3JFbGUuc2NyYXRjaCgnX2NvbXBvdW5kUmVzaXplJyk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY3JhdGNoVXRpbGl0aWVzOyJdfQ==
