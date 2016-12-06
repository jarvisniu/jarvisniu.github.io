
/*
 * A* computing engine
 *
 * Algorithm:
 *   1. Create a open list that contains the nodes that can be reached, initially only start node;
 *   2. Expand the list by adding neighbours of the node whose "f" is smallest;
 *   3. The neighbours must not in open list, closed list and not be obstacle;
 *   4. Move this node to the closed list;
 *   5. Calculate the "g", "h", "f" of the new added nodes;
 *   6. Resort the open list by "f";
 *   7. Loop from step 2 to 6 until the expanded nodes contains the end node or the open list is empty.
 *
 * Means of "g", "h", "f":
 *   1. g: distance that has gone
 *   2. h: shortest distance to the destination
 *   3. f: g + h
 *
 * API:
 *   finished: bool - Whether the algorithm is finished
 *   isRunning: bool - Whether the algorithm is running
 *   fps: bool - AutoStep speed
 *   result: Object - The result of resolving
 *     success: bool - Whether reach the end
 *     time: number - Elapsed time used to solve the process
 *     step: int - Steps used in the
 *   init() - Init the variables
 *   step() - Next step of solving
 *   run(fps) - Run the algorithm. If the parameter fps is given, the process will be animated.
 *
 *
 * Events:
 *   nodeChanged: a node state is changed, dedicated to refresh the UI
 *   finished: the algorithm is finished, no matter if success
 */

(function() {
  var hasProp = {}.hasOwnProperty;

  AStar.Engine = (function() {
    function Engine(net) {
      var _end, _net, _step, autoStep, compareNodes, listClose, listOpen, nodeId, recalculateLastNode, startTime, stepCount, traceShortestPath;
      Bu.Event.apply(this);
      _net = net;
      this.finished = false;
      this.isRunning = false;
      this.fps = 10;
      listOpen = [];
      listClose = [];
      nodeId = 0;
      startTime = 0;
      stepCount = 0;
      this.result = {};
      this.init = (function(_this) {
        return function() {
          var i, j, k, l, node, ref, ref1, ref2;
          for (i = k = 0, ref = _net.width; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
            for (j = l = 0, ref1 = _net.height; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
              node = (ref2 = _net.nodes[i]) != null ? ref2[j] : void 0;
              if (node == null) {
                continue;
              }
              if (node.state > AStar.NODE_STATE_END && node.state < AStar.NODE_STATE_OBSTACLE) {
                node.state = AStar.NODE_STATE_DEFAULT;
              }
              node.prevNode = null;
              node.neighbours = null;
              _this.trigger('nodeChanged', node.position);
            }
          }
          listOpen = [];
          listClose = [];
          stepCount = 0;
          _this.finished = false;
          _net.startNode.g = 0;
          _net.startNode.h = parseInt(_net.calcShortestDistance(_net.startNode, _net.endNode));
          _this.trigger('nodeChanged', _net.startNode.position);
          return listOpen.push(_net.startNode);
        };
      })(this);
      this.step = (function(_this) {
        return function() {
          if (!_this.finished) {
            return _step();
          } else {
            return console.log('It has been finished.');
          }
        };
      })(this);
      this.run = (function(_this) {
        return function(fps) {
          var results;
          if (fps != null) {
            _this.fps = fps;
          }
          if (!_this.isRunning) {
            _this.init();
            _this.isRunning = true;
            startTime = Date.now();
            if (fps) {
              return autoStep();
            } else {
              results = [];
              while (!_this.finished) {
                results.push(_step());
              }
              return results;
            }
          }
        };
      })(this);
      autoStep = (function(_this) {
        return function() {
          if (!_this.finished) {
            _step();
            return setTimeout(autoStep, 1000 / _this.fps);
          }
        };
      })(this);
      _step = (function(_this) {
        return function() {
          var currentNode, i, neighbour, neighbours;
          currentNode = listOpen.shift();
          if (currentNode == null) {
            _end(false);
            return;
          }
          if (currentNode.state !== AStar.NODE_STATE_START) {
            currentNode.state = AStar.NODE_STATE_DETECTED;
            _this.trigger('nodeChanged', currentNode.position);
          }
          listClose.push(currentNode);
          recalculateLastNode(currentNode);
          neighbours = _net.getNeighboursOf(currentNode);
          for (i in neighbours) {
            if (!hasProp.call(neighbours, i)) continue;
            neighbour = neighbours[i];
            if (listClose.indexOf(neighbour) > -1) {

            } else if (listOpen.indexOf(neighbour) > -1) {

            } else {
              neighbour.prevNode = currentNode;
              neighbour.id = nodeId++;
              if (neighbour.state !== AStar.NODE_STATE_END) {
                neighbour.state = AStar.NODE_STATE_REACHABLE;
              }
              neighbour.g = currentNode.g + neighbour.calcShortestDistanceTo(currentNode);
              neighbour.h = neighbour.calcShortestDistanceTo(_net.endNode);
              _this.trigger('nodeChanged', neighbour.position);
              recalculateLastNode(neighbour);
              listOpen.push(neighbour);
            }
          }
          listOpen.sort(compareNodes);
          if (listOpen[0] === _net.endNode) {
            _net.endNode.state = AStar.NODE_STATE_END;
            _this.trigger('nodeChanged', _net.endNode.position);
            traceShortestPath();
            _end(true);
          }
          return stepCount++;
        };
      })(this);
      _end = (function(_this) {
        return function(success) {
          _this.finished = true;
          _this.isRunning = false;
          _this.result.success = success;
          _this.result.time = Math.round(Date.now() - startTime) + 'ms';
          _this.result.step = stepCount;
          return _this.trigger('finished', _this.result);
        };
      })(this);
      compareNodes = function(node1, node2) {
        var delta;
        delta = node1.f() - node2.f();
        if (delta === 0) {
          delta = node2.id - node1.id;
        }
        return delta;
      };
      recalculateLastNode = (function(_this) {
        return function(node) {
          var g0, g1, i, neighbour, neighbours, results;
          neighbours = _net.getNeighboursOf(node);
          results = [];
          for (i in neighbours) {
            if (!hasProp.call(neighbours, i)) continue;
            neighbour = neighbours[i];
            if (neighbour.state > AStar.NODE_STATE_DEFAULT && neighbour.state < AStar.NODE_STATE_OBSTACLE && neighbour.state !== AStar.NODE_STATE_END) {
              g0 = node.g;
              g1 = neighbour.g + node.calcShortestDistanceTo(neighbour);
              if (g0 > g1) {
                node.prevNode = neighbour;
                node.g = g1;
                results.push(_this.trigger('nodeChanged', node.position));
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this);
      traceShortestPath = (function(_this) {
        return function() {
          var middleNode, results;
          middleNode = _net.endNode.prevNode;
          results = [];
          while (middleNode !== _net.startNode) {
            middleNode.state = AStar.NODE_STATE_SHORTEST;
            _this.trigger('nodeChanged', middleNode.position);
            results.push(middleNode = middleNode.prevNode);
          }
          return results;
        };
      })(this);
    }

    return Engine;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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O1VBSnpCLENBQUE7O1FBSG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQXhKUjs7Ozs7QUFyQ2QiLCJmaWxlIjoiYS1zdGFyL0VuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG4jIEEqIGNvbXB1dGluZyBlbmdpbmVcclxuI1xyXG4jIEFsZ29yaXRobTpcclxuIyAgIDEuIENyZWF0ZSBhIG9wZW4gbGlzdCB0aGF0IGNvbnRhaW5zIHRoZSBub2RlcyB0aGF0IGNhbiBiZSByZWFjaGVkLCBpbml0aWFsbHkgb25seSBzdGFydCBub2RlO1xyXG4jICAgMi4gRXhwYW5kIHRoZSBsaXN0IGJ5IGFkZGluZyBuZWlnaGJvdXJzIG9mIHRoZSBub2RlIHdob3NlIFwiZlwiIGlzIHNtYWxsZXN0O1xyXG4jICAgMy4gVGhlIG5laWdoYm91cnMgbXVzdCBub3QgaW4gb3BlbiBsaXN0LCBjbG9zZWQgbGlzdCBhbmQgbm90IGJlIG9ic3RhY2xlO1xyXG4jICAgNC4gTW92ZSB0aGlzIG5vZGUgdG8gdGhlIGNsb3NlZCBsaXN0O1xyXG4jICAgNS4gQ2FsY3VsYXRlIHRoZSBcImdcIiwgXCJoXCIsIFwiZlwiIG9mIHRoZSBuZXcgYWRkZWQgbm9kZXM7XHJcbiMgICA2LiBSZXNvcnQgdGhlIG9wZW4gbGlzdCBieSBcImZcIjtcclxuIyAgIDcuIExvb3AgZnJvbSBzdGVwIDIgdG8gNiB1bnRpbCB0aGUgZXhwYW5kZWQgbm9kZXMgY29udGFpbnMgdGhlIGVuZCBub2RlIG9yIHRoZSBvcGVuIGxpc3QgaXMgZW1wdHkuXHJcbiNcclxuIyBNZWFucyBvZiBcImdcIiwgXCJoXCIsIFwiZlwiOlxyXG4jICAgMS4gZzogZGlzdGFuY2UgdGhhdCBoYXMgZ29uZVxyXG4jICAgMi4gaDogc2hvcnRlc3QgZGlzdGFuY2UgdG8gdGhlIGRlc3RpbmF0aW9uXHJcbiMgICAzLiBmOiBnICsgaFxyXG4jXHJcbiMgQVBJOlxyXG4jICAgZmluaXNoZWQ6IGJvb2wgLSBXaGV0aGVyIHRoZSBhbGdvcml0aG0gaXMgZmluaXNoZWRcclxuIyAgIGlzUnVubmluZzogYm9vbCAtIFdoZXRoZXIgdGhlIGFsZ29yaXRobSBpcyBydW5uaW5nXHJcbiMgICBmcHM6IGJvb2wgLSBBdXRvU3RlcCBzcGVlZFxyXG4jICAgcmVzdWx0OiBPYmplY3QgLSBUaGUgcmVzdWx0IG9mIHJlc29sdmluZ1xyXG4jICAgICBzdWNjZXNzOiBib29sIC0gV2hldGhlciByZWFjaCB0aGUgZW5kXHJcbiMgICAgIHRpbWU6IG51bWJlciAtIEVsYXBzZWQgdGltZSB1c2VkIHRvIHNvbHZlIHRoZSBwcm9jZXNzXHJcbiMgICAgIHN0ZXA6IGludCAtIFN0ZXBzIHVzZWQgaW4gdGhlXHJcbiMgICBpbml0KCkgLSBJbml0IHRoZSB2YXJpYWJsZXNcclxuIyAgIHN0ZXAoKSAtIE5leHQgc3RlcCBvZiBzb2x2aW5nXHJcbiMgICBydW4oZnBzKSAtIFJ1biB0aGUgYWxnb3JpdGhtLiBJZiB0aGUgcGFyYW1ldGVyIGZwcyBpcyBnaXZlbiwgdGhlIHByb2Nlc3Mgd2lsbCBiZSBhbmltYXRlZC5cclxuI1xyXG4jXHJcbiMgRXZlbnRzOlxyXG4jICAgbm9kZUNoYW5nZWQ6IGEgbm9kZSBzdGF0ZSBpcyBjaGFuZ2VkLCBkZWRpY2F0ZWQgdG8gcmVmcmVzaCB0aGUgVUlcclxuIyAgIGZpbmlzaGVkOiB0aGUgYWxnb3JpdGhtIGlzIGZpbmlzaGVkLCBubyBtYXR0ZXIgaWYgc3VjY2Vzc1xyXG4jIyNcclxuXHJcbmNsYXNzIEFTdGFyLkVuZ2luZVxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKG5ldCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IHRoaXNcclxuXHJcblx0XHRfbmV0ID0gbmV0XHJcblxyXG5cdFx0QGZpbmlzaGVkID0gZmFsc2VcclxuXHRcdEBpc1J1bm5pbmcgPSBmYWxzZVxyXG5cclxuXHRcdEBmcHMgPSAxMFxyXG5cclxuXHRcdGxpc3RPcGVuID0gW11cclxuXHRcdGxpc3RDbG9zZSA9IFtdXHJcblxyXG5cdFx0bm9kZUlkID0gMCAjIEFkZCBhbiBpZCB0byBldmVyeSBub2RlIGZvciBjb21wYXJpbmcgd2hlbiB0aGVpciBcImZcIiBpcyBlcXVhbDogcmVjZW50IG5vZGUgaXMgcHJpb3IuXHJcblxyXG5cdFx0c3RhcnRUaW1lID0gMFxyXG5cdFx0c3RlcENvdW50ID0gMFxyXG5cclxuXHRcdEByZXN1bHQgPSB7fVxyXG5cclxuXHRcdEBpbml0ID0gPT5cclxuXHRcdFx0IyBmb3Igbm9kZSBpbiBsaXN0Q2xvc2VcclxuXHRcdFx0IyBcdG5vZGUuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX0RFRkFVTFRcclxuXHRcdFx0IyBcdG5vZGUucHJldk5vZGUgPSBudWxsXHJcblx0XHRcdCMgXHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBub2RlLnBvc2l0aW9uXHJcblx0XHRcdGZvciBpIGluIFswLi5fbmV0LndpZHRoXVxyXG5cdFx0XHRcdGZvciBqIGluIFswLi5fbmV0LmhlaWdodF1cclxuXHRcdFx0XHRcdG5vZGUgPSBfbmV0Lm5vZGVzW2ldP1tqXVxyXG5cdFx0XHRcdFx0Y29udGludWUgdW5sZXNzIG5vZGU/XHJcblx0XHRcdFx0XHRpZiBub2RlLnN0YXRlID4gQVN0YXIuTk9ERV9TVEFURV9FTkQgYW5kIG5vZGUuc3RhdGUgPCBBU3Rhci5OT0RFX1NUQVRFX09CU1RBQ0xFXHJcblx0XHRcdFx0XHRcdG5vZGUuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX0RFRkFVTFRcclxuXHRcdFx0XHRcdG5vZGUucHJldk5vZGUgPSBudWxsXHJcblx0XHRcdFx0XHRub2RlLm5laWdoYm91cnMgPSBudWxsXHJcblx0XHRcdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBub2RlLnBvc2l0aW9uXHJcblx0XHRcdGxpc3RPcGVuID0gW11cclxuXHRcdFx0bGlzdENsb3NlID0gW11cclxuXHJcblx0XHRcdHN0ZXBDb3VudCA9IDBcclxuXHRcdFx0QGZpbmlzaGVkID0gZmFsc2VcclxuXHJcblx0XHRcdF9uZXQuc3RhcnROb2RlLmcgPSAwXHJcblx0XHRcdF9uZXQuc3RhcnROb2RlLmggPSBwYXJzZUludChfbmV0LmNhbGNTaG9ydGVzdERpc3RhbmNlKF9uZXQuc3RhcnROb2RlLCBfbmV0LmVuZE5vZGUpKVxyXG5cdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBfbmV0LnN0YXJ0Tm9kZS5wb3NpdGlvblxyXG5cclxuXHRcdFx0bGlzdE9wZW4ucHVzaCBfbmV0LnN0YXJ0Tm9kZVxyXG5cclxuXHRcdCMgcnVuIHRoZSBlbmdpbmUgYnkgb25lIHN0ZXBcclxuXHRcdEBzdGVwID0gPT5cclxuXHRcdFx0aWYgIUBmaW5pc2hlZFxyXG5cdFx0XHRcdF9zdGVwKClcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUubG9nICdJdCBoYXMgYmVlbiBmaW5pc2hlZC4nXHJcblxyXG5cdFx0IyBydW4gdGhlIGVuZ2luZSBhbGwgdGhlIHdheSB0byBmaW5pc2hcclxuXHRcdEBydW4gPSAoZnBzKSA9PlxyXG5cdFx0XHRAZnBzID0gZnBzIGlmIGZwcz9cclxuXHRcdFx0aWYgbm90IEBpc1J1bm5pbmdcclxuXHRcdFx0XHRAaW5pdCgpXHJcblx0XHRcdFx0QGlzUnVubmluZyA9IHRydWVcclxuXHRcdFx0XHRzdGFydFRpbWUgPSBEYXRlLm5vdygpXHJcblx0XHRcdFx0aWYgZnBzXHJcblx0XHRcdFx0XHRhdXRvU3RlcCgpXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0d2hpbGUgbm90IEBmaW5pc2hlZFxyXG5cdFx0XHRcdFx0XHRfc3RlcCgpXHJcblxyXG5cdFx0YXV0b1N0ZXAgPSA9PlxyXG5cdFx0XHRpZiBub3QgQGZpbmlzaGVkXHJcblx0XHRcdFx0X3N0ZXAoKVxyXG5cdFx0XHRcdHNldFRpbWVvdXQgYXV0b1N0ZXAsIDEwMDAgLyBAZnBzXHJcblxyXG5cdFx0X3N0ZXAgPSA9PlxyXG5cdFx0XHRjdXJyZW50Tm9kZSA9IGxpc3RPcGVuLnNoaWZ0KClcclxuXHRcdFx0aWYgbm90IGN1cnJlbnROb2RlP1xyXG5cdFx0XHRcdF9lbmQgZmFsc2VcclxuXHRcdFx0XHRyZXR1cm5cclxuXHJcblx0XHRcdGlmIGN1cnJlbnROb2RlLnN0YXRlICE9IEFTdGFyLk5PREVfU1RBVEVfU1RBUlRcclxuXHRcdFx0XHRjdXJyZW50Tm9kZS5zdGF0ZSA9IEFTdGFyLk5PREVfU1RBVEVfREVURUNURURcclxuXHRcdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBjdXJyZW50Tm9kZS5wb3NpdGlvblxyXG5cclxuXHRcdFx0bGlzdENsb3NlLnB1c2ggY3VycmVudE5vZGVcclxuXHJcblx0XHRcdHJlY2FsY3VsYXRlTGFzdE5vZGUgY3VycmVudE5vZGVcclxuXHJcblx0XHRcdG5laWdoYm91cnMgPSBfbmV0LmdldE5laWdoYm91cnNPZihjdXJyZW50Tm9kZSlcclxuXHJcblx0XHRcdGZvciBvd24gaSBvZiBuZWlnaGJvdXJzXHJcblx0XHRcdFx0bmVpZ2hib3VyID0gbmVpZ2hib3Vyc1tpXVxyXG5cclxuXHRcdFx0XHRpZiBsaXN0Q2xvc2UuaW5kZXhPZihuZWlnaGJvdXIpID4gLTFcclxuXHRcdFx0XHRlbHNlIGlmIGxpc3RPcGVuLmluZGV4T2YobmVpZ2hib3VyKSA+IC0xXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0bmVpZ2hib3VyLnByZXZOb2RlID0gY3VycmVudE5vZGVcclxuXHRcdFx0XHRcdG5laWdoYm91ci5pZCA9IG5vZGVJZCsrXHJcblxyXG5cdFx0XHRcdFx0aWYgbmVpZ2hib3VyLnN0YXRlICE9IEFTdGFyLk5PREVfU1RBVEVfRU5EXHJcblx0XHRcdFx0XHRcdG5laWdoYm91ci5zdGF0ZSA9IEFTdGFyLk5PREVfU1RBVEVfUkVBQ0hBQkxFXHJcblxyXG5cdFx0XHRcdFx0bmVpZ2hib3VyLmcgPSBjdXJyZW50Tm9kZS5nICsgbmVpZ2hib3VyLmNhbGNTaG9ydGVzdERpc3RhbmNlVG8oY3VycmVudE5vZGUpXHJcblx0XHRcdFx0XHRuZWlnaGJvdXIuaCA9IG5laWdoYm91ci5jYWxjU2hvcnRlc3REaXN0YW5jZVRvKF9uZXQuZW5kTm9kZSlcclxuXHRcdFx0XHRcdEB0cmlnZ2VyICdub2RlQ2hhbmdlZCcsIG5laWdoYm91ci5wb3NpdGlvblxyXG5cclxuXHRcdFx0XHRcdHJlY2FsY3VsYXRlTGFzdE5vZGUgbmVpZ2hib3VyXHJcblx0XHRcdFx0XHRsaXN0T3Blbi5wdXNoIG5laWdoYm91clxyXG5cclxuXHRcdFx0bGlzdE9wZW4uc29ydCBjb21wYXJlTm9kZXNcclxuXHJcblx0XHRcdCMgZGV0ZWN0IGVuZFxyXG5cdFx0XHRpZiBsaXN0T3BlblswXSA9PSBfbmV0LmVuZE5vZGVcclxuXHRcdFx0XHRfbmV0LmVuZE5vZGUuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX0VORFxyXG5cdFx0XHRcdEB0cmlnZ2VyICdub2RlQ2hhbmdlZCcsIF9uZXQuZW5kTm9kZS5wb3NpdGlvblxyXG5cclxuXHRcdFx0XHR0cmFjZVNob3J0ZXN0UGF0aCgpXHJcblx0XHRcdFx0X2VuZCB0cnVlXHJcblxyXG5cdFx0XHRzdGVwQ291bnQrK1xyXG5cclxuXHRcdF9lbmQgPSAoc3VjY2VzcykgPT5cclxuXHRcdFx0QGZpbmlzaGVkID0gdHJ1ZVxyXG5cdFx0XHRAaXNSdW5uaW5nID0gZmFsc2VcclxuXHJcblx0XHRcdEByZXN1bHQuc3VjY2VzcyA9IHN1Y2Nlc3NcclxuXHRcdFx0QHJlc3VsdC50aW1lID0gTWF0aC5yb3VuZChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSArICdtcydcclxuXHRcdFx0QHJlc3VsdC5zdGVwID0gc3RlcENvdW50XHJcblxyXG5cdFx0XHRAdHJpZ2dlciAnZmluaXNoZWQnLCBAcmVzdWx0XHJcblxyXG5cclxuXHRcdGNvbXBhcmVOb2RlcyA9IChub2RlMSwgbm9kZTIpIC0+XHJcblx0XHRcdGRlbHRhID0gbm9kZTEuZigpIC0gbm9kZTIuZigpXHJcblx0XHRcdCMgd2l0aG91dCB0aGlzIHN0ZXAgaXQgd2lsbCBzaG93cyBzb21lIHJhbmRvbSB3aGljaCBzZWVtcyBzdHVwaWRcclxuXHRcdFx0ZGVsdGEgPSBub2RlMi5pZCAtIChub2RlMS5pZCkgaWYgZGVsdGEgPT0gMFxyXG5cdFx0XHRyZXR1cm4gZGVsdGFcclxuXHJcblx0XHRyZWNhbGN1bGF0ZUxhc3ROb2RlID0gKG5vZGUpID0+XHJcblx0XHRcdG5laWdoYm91cnMgPSBfbmV0LmdldE5laWdoYm91cnNPZihub2RlKVxyXG5cclxuXHRcdFx0IyBkZXRlY3QgZnJvbSBpdHMgbmVpZ2hib3VycyB0byBzZWUgd2hldGhlciB0aGVyZSBpcyBhIG5lYXJlciBub2RlIHRvIGJlIGl0cyBwYXJlbnQgbm9kZVxyXG5cdFx0XHRmb3Igb3duIGkgb2YgbmVpZ2hib3Vyc1xyXG5cdFx0XHRcdG5laWdoYm91ciA9IG5laWdoYm91cnNbaV1cclxuXHRcdFx0XHQjIHJlYWNoZWQgbm9kZXM6IHN0YXJ0IG5vZGUsIGJlaW5nIHJlYWNoaW5nLCBoYXMgcmVhY2hlZFxyXG5cdFx0XHRcdGlmIG5laWdoYm91ci5zdGF0ZSA+IEFTdGFyLk5PREVfU1RBVEVfREVGQVVMVCBhbmQgbmVpZ2hib3VyLnN0YXRlIDwgQVN0YXIuTk9ERV9TVEFURV9PQlNUQUNMRSBhbmQgbmVpZ2hib3VyLnN0YXRlICE9IEFTdGFyLk5PREVfU1RBVEVfRU5EXHJcblxyXG5cdFx0XHRcdFx0ZzAgPSBub2RlLmdcclxuXHRcdFx0XHRcdGcxID0gbmVpZ2hib3VyLmcgKyBub2RlLmNhbGNTaG9ydGVzdERpc3RhbmNlVG8obmVpZ2hib3VyKVxyXG5cdFx0XHRcdFx0aWYgZzAgPiBnMVxyXG5cdFx0XHRcdFx0XHRub2RlLnByZXZOb2RlID0gbmVpZ2hib3VyXHJcblx0XHRcdFx0XHRcdG5vZGUuZyA9IGcxXHJcblx0XHRcdFx0XHRcdEB0cmlnZ2VyICdub2RlQ2hhbmdlZCcsIG5vZGUucG9zaXRpb25cclxuXHJcblx0XHQjIHRyYWNlIHRoZSBzaG9ydGVzdCBwYXRoIGFuZCBjaGFuZ2UgdGhlIHN0YXRlIGZyb20gREVURUNURUQgdG8gU0hPUlRFU1RcclxuXHRcdHRyYWNlU2hvcnRlc3RQYXRoID0gPT5cclxuXHRcdFx0bWlkZGxlTm9kZSA9IF9uZXQuZW5kTm9kZS5wcmV2Tm9kZVxyXG5cclxuXHRcdFx0d2hpbGUgbWlkZGxlTm9kZSAhPSBfbmV0LnN0YXJ0Tm9kZVxyXG5cdFx0XHRcdG1pZGRsZU5vZGUuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX1NIT1JURVNUXHJcblxyXG5cdFx0XHRcdEB0cmlnZ2VyICdub2RlQ2hhbmdlZCcsIG1pZGRsZU5vZGUucG9zaXRpb25cclxuXHRcdFx0XHRtaWRkbGVOb2RlID0gbWlkZGxlTm9kZS5wcmV2Tm9kZVxyXG4iXX0=
