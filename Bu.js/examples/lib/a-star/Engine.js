
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
          listOpen = [];
          listClose = [];
          stepCount = 0;
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

//# sourceMappingURL=data:application/json;base64,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LENBQUM7Y0FDVixFQUFBLEdBQUssU0FBUyxDQUFDLENBQVYsR0FBYyxJQUFJLENBQUMsc0JBQUwsQ0FBNEIsU0FBNUI7Y0FDbkIsSUFBRyxFQUFBLEdBQUssRUFBUjtnQkFDQyxJQUFJLENBQUMsUUFBTCxHQUFnQjtnQkFDaEIsSUFBSSxDQUFDLENBQUwsR0FBUzs2QkFDVCxLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0IsSUFBSSxDQUFDLFFBQTdCLEdBSEQ7ZUFBQSxNQUFBO3FDQUFBO2VBSkQ7YUFBQSxNQUFBO21DQUFBOztBQUhEOztRQUpxQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFpQnRCLGlCQUFBLEdBQW9CLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNuQixjQUFBO1VBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUM7QUFFMUI7aUJBQU0sVUFBQSxLQUFjLElBQUksQ0FBQyxTQUF6QjtZQUNDLFVBQVUsQ0FBQyxLQUFYLEdBQW1CLEtBQUssQ0FBQztZQUV6QixLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0IsVUFBVSxDQUFDLFFBQW5DO3lCQUNBLFVBQUEsR0FBYSxVQUFVLENBQUM7VUFKekIsQ0FBQTs7UUFIbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBMUlSOzs7OztBQXJDZCIsImZpbGUiOiJhLXN0YXIvRW5naW5lLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcbiMgQSogY29tcHV0aW5nIGVuZ2luZVxyXG4jXHJcbiMgQWxnb3JpdGhtOlxyXG4jICAgMS4gQ3JlYXRlIGEgb3BlbiBsaXN0IHRoYXQgY29udGFpbnMgdGhlIG5vZGVzIHRoYXQgY2FuIGJlIHJlYWNoZWQsIGluaXRpYWxseSBvbmx5IHN0YXJ0IG5vZGU7XHJcbiMgICAyLiBFeHBhbmQgdGhlIGxpc3QgYnkgYWRkaW5nIG5laWdoYm91cnMgb2YgdGhlIG5vZGUgd2hvc2UgXCJmXCIgaXMgc21hbGxlc3Q7XHJcbiMgICAzLiBUaGUgbmVpZ2hib3VycyBtdXN0IG5vdCBpbiBvcGVuIGxpc3QsIGNsb3NlZCBsaXN0IGFuZCBub3QgYmUgb2JzdGFjbGU7XHJcbiMgICA0LiBNb3ZlIHRoaXMgbm9kZSB0byB0aGUgY2xvc2VkIGxpc3Q7XHJcbiMgICA1LiBDYWxjdWxhdGUgdGhlIFwiZ1wiLCBcImhcIiwgXCJmXCIgb2YgdGhlIG5ldyBhZGRlZCBub2RlcztcclxuIyAgIDYuIFJlc29ydCB0aGUgb3BlbiBsaXN0IGJ5IFwiZlwiO1xyXG4jICAgNy4gTG9vcCBmcm9tIHN0ZXAgMiB0byA2IHVudGlsIHRoZSBleHBhbmRlZCBub2RlcyBjb250YWlucyB0aGUgZW5kIG5vZGUgb3IgdGhlIG9wZW4gbGlzdCBpcyBlbXB0eS5cclxuI1xyXG4jIE1lYW5zIG9mIFwiZ1wiLCBcImhcIiwgXCJmXCI6XHJcbiMgICAxLiBnOiBkaXN0YW5jZSB0aGF0IGhhcyBnb25lXHJcbiMgICAyLiBoOiBzaG9ydGVzdCBkaXN0YW5jZSB0byB0aGUgZGVzdGluYXRpb25cclxuIyAgIDMuIGY6IGcgKyBoXHJcbiNcclxuIyBBUEk6XHJcbiMgICBmaW5pc2hlZDogYm9vbCAtIFdoZXRoZXIgdGhlIGFsZ29yaXRobSBpcyBmaW5pc2hlZFxyXG4jICAgaXNSdW5uaW5nOiBib29sIC0gV2hldGhlciB0aGUgYWxnb3JpdGhtIGlzIHJ1bm5pbmdcclxuIyAgIGZwczogYm9vbCAtIEF1dG9TdGVwIHNwZWVkXHJcbiMgICByZXN1bHQ6IE9iamVjdCAtIFRoZSByZXN1bHQgb2YgcmVzb2x2aW5nXHJcbiMgICAgIHN1Y2Nlc3M6IGJvb2wgLSBXaGV0aGVyIHJlYWNoIHRoZSBlbmRcclxuIyAgICAgdGltZTogbnVtYmVyIC0gRWxhcHNlZCB0aW1lIHVzZWQgdG8gc29sdmUgdGhlIHByb2Nlc3NcclxuIyAgICAgc3RlcDogaW50IC0gU3RlcHMgdXNlZCBpbiB0aGVcclxuIyAgIGluaXQoKSAtIEluaXQgdGhlIHZhcmlhYmxlc1xyXG4jICAgc3RlcCgpIC0gTmV4dCBzdGVwIG9mIHNvbHZpbmdcclxuIyAgIHJ1bihmcHMpIC0gUnVuIHRoZSBhbGdvcml0aG0uIElmIHRoZSBwYXJhbWV0ZXIgZnBzIGlzIGdpdmVuLCB0aGUgcHJvY2VzcyB3aWxsIGJlIGFuaW1hdGVkLlxyXG4jXHJcbiNcclxuIyBFdmVudHM6XHJcbiMgICBub2RlQ2hhbmdlZDogYSBub2RlIHN0YXRlIGlzIGNoYW5nZWQsIGRlZGljYXRlZCB0byByZWZyZXNoIHRoZSBVSVxyXG4jICAgZmluaXNoZWQ6IHRoZSBhbGdvcml0aG0gaXMgZmluaXNoZWQsIG5vIG1hdHRlciBpZiBzdWNjZXNzXHJcbiMjI1xyXG5cclxuY2xhc3MgQVN0YXIuRW5naW5lXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAobmV0KSAtPlxyXG5cdFx0QnUuRXZlbnQuYXBwbHkgdGhpc1xyXG5cclxuXHRcdF9uZXQgPSBuZXRcclxuXHJcblx0XHRAZmluaXNoZWQgPSBmYWxzZVxyXG5cdFx0QGlzUnVubmluZyA9IGZhbHNlXHJcblxyXG5cdFx0QGZwcyA9IDEwXHJcblxyXG5cdFx0bGlzdE9wZW4gPSBbXVxyXG5cdFx0bGlzdENsb3NlID0gW11cclxuXHJcblx0XHRub2RlSWQgPSAwICMgQWRkIGFuIGlkIHRvIGV2ZXJ5IG5vZGUgZm9yIGNvbXBhcmluZyB3aGVuIHRoZWlyIFwiZlwiIGlzIGVxdWFsOiByZWNlbnQgbm9kZSBpcyBwcmlvci5cclxuXHJcblx0XHRzdGFydFRpbWUgPSAwXHJcblx0XHRzdGVwQ291bnQgPSAwXHJcblxyXG5cdFx0QHJlc3VsdCA9IHt9XHJcblxyXG5cdFx0QGluaXQgPSA9PlxyXG5cdFx0XHRsaXN0T3BlbiA9IFtdXHJcblx0XHRcdGxpc3RDbG9zZSA9IFtdXHJcblxyXG5cdFx0XHRzdGVwQ291bnQgPSAwXHJcblxyXG5cdFx0XHRfbmV0LnN0YXJ0Tm9kZS5nID0gMFxyXG5cdFx0XHRfbmV0LnN0YXJ0Tm9kZS5oID0gcGFyc2VJbnQoX25ldC5jYWxjU2hvcnRlc3REaXN0YW5jZShfbmV0LnN0YXJ0Tm9kZSwgX25ldC5lbmROb2RlKSlcclxuXHRcdFx0QHRyaWdnZXIgJ25vZGVDaGFuZ2VkJywgX25ldC5zdGFydE5vZGUucG9zaXRpb25cclxuXHJcblx0XHRcdGxpc3RPcGVuLnB1c2ggX25ldC5zdGFydE5vZGVcclxuXHJcblx0XHQjIHJ1biB0aGUgZW5naW5lIGJ5IG9uZSBzdGVwXHJcblx0XHRAc3RlcCA9ID0+XHJcblx0XHRcdGlmICFAZmluaXNoZWRcclxuXHRcdFx0XHRfc3RlcCgpXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLmxvZyAnSXQgaGFzIGJlZW4gZmluaXNoZWQuJ1xyXG5cclxuXHRcdCMgcnVuIHRoZSBlbmdpbmUgYWxsIHRoZSB3YXkgdG8gZmluaXNoXHJcblx0XHRAcnVuID0gKGZwcykgPT5cclxuXHRcdFx0QGZwcyA9IGZwcyBpZiBmcHM/XHJcblx0XHRcdGlmIG5vdCBAaXNSdW5uaW5nXHJcblx0XHRcdFx0QGluaXQoKVxyXG5cdFx0XHRcdEBpc1J1bm5pbmcgPSB0cnVlXHJcblx0XHRcdFx0c3RhcnRUaW1lID0gRGF0ZS5ub3coKVxyXG5cdFx0XHRcdGlmIGZwc1xyXG5cdFx0XHRcdFx0YXV0b1N0ZXAoKVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHdoaWxlIG5vdCBAZmluaXNoZWRcclxuXHRcdFx0XHRcdFx0X3N0ZXAoKVxyXG5cclxuXHRcdGF1dG9TdGVwID0gPT5cclxuXHRcdFx0aWYgbm90IEBmaW5pc2hlZFxyXG5cdFx0XHRcdF9zdGVwKClcclxuXHRcdFx0XHRzZXRUaW1lb3V0IGF1dG9TdGVwLCAxMDAwIC8gQGZwc1xyXG5cclxuXHRcdF9zdGVwID0gPT5cclxuXHRcdFx0Y3VycmVudE5vZGUgPSBsaXN0T3Blbi5zaGlmdCgpXHJcblx0XHRcdGlmIG5vdCBjdXJyZW50Tm9kZT9cclxuXHRcdFx0XHRfZW5kIGZhbHNlXHJcblx0XHRcdFx0cmV0dXJuXHJcblxyXG5cdFx0XHRpZiBjdXJyZW50Tm9kZS5zdGF0ZSAhPSBBU3Rhci5OT0RFX1NUQVRFX1NUQVJUXHJcblx0XHRcdFx0Y3VycmVudE5vZGUuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX0RFVEVDVEVEXHJcblx0XHRcdFx0QHRyaWdnZXIgJ25vZGVDaGFuZ2VkJywgY3VycmVudE5vZGUucG9zaXRpb25cclxuXHJcblx0XHRcdGxpc3RDbG9zZS5wdXNoIGN1cnJlbnROb2RlXHJcblxyXG5cdFx0XHRyZWNhbGN1bGF0ZUxhc3ROb2RlIGN1cnJlbnROb2RlXHJcblxyXG5cdFx0XHRuZWlnaGJvdXJzID0gX25ldC5nZXROZWlnaGJvdXJzT2YoY3VycmVudE5vZGUpXHJcblxyXG5cdFx0XHRmb3Igb3duIGkgb2YgbmVpZ2hib3Vyc1xyXG5cdFx0XHRcdG5laWdoYm91ciA9IG5laWdoYm91cnNbaV1cclxuXHJcblx0XHRcdFx0aWYgbGlzdENsb3NlLmluZGV4T2YobmVpZ2hib3VyKSA+IC0xXHJcblx0XHRcdFx0ZWxzZSBpZiBsaXN0T3Blbi5pbmRleE9mKG5laWdoYm91cikgPiAtMVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdG5laWdoYm91ci5wcmV2Tm9kZSA9IGN1cnJlbnROb2RlXHJcblx0XHRcdFx0XHRuZWlnaGJvdXIuaWQgPSBub2RlSWQrK1xyXG5cclxuXHRcdFx0XHRcdGlmIG5laWdoYm91ci5zdGF0ZSAhPSBBU3Rhci5OT0RFX1NUQVRFX0VORFxyXG5cdFx0XHRcdFx0XHRuZWlnaGJvdXIuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX1JFQUNIQUJMRVxyXG5cclxuXHRcdFx0XHRcdG5laWdoYm91ci5nID0gY3VycmVudE5vZGUuZyArIG5laWdoYm91ci5jYWxjU2hvcnRlc3REaXN0YW5jZVRvKGN1cnJlbnROb2RlKVxyXG5cdFx0XHRcdFx0bmVpZ2hib3VyLmggPSBuZWlnaGJvdXIuY2FsY1Nob3J0ZXN0RGlzdGFuY2VUbyhfbmV0LmVuZE5vZGUpXHJcblx0XHRcdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBuZWlnaGJvdXIucG9zaXRpb25cclxuXHJcblx0XHRcdFx0XHRyZWNhbGN1bGF0ZUxhc3ROb2RlIG5laWdoYm91clxyXG5cdFx0XHRcdFx0bGlzdE9wZW4ucHVzaCBuZWlnaGJvdXJcclxuXHJcblx0XHRcdGxpc3RPcGVuLnNvcnQgY29tcGFyZU5vZGVzXHJcblxyXG5cdFx0XHQjIGRldGVjdCBlbmRcclxuXHRcdFx0aWYgbGlzdE9wZW5bMF0gPT0gX25ldC5lbmROb2RlXHJcblx0XHRcdFx0X25ldC5lbmROb2RlLnN0YXRlID0gQVN0YXIuTk9ERV9TVEFURV9FTkRcclxuXHRcdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBfbmV0LmVuZE5vZGUucG9zaXRpb25cclxuXHJcblx0XHRcdFx0dHJhY2VTaG9ydGVzdFBhdGgoKVxyXG5cdFx0XHRcdF9lbmQgdHJ1ZVxyXG5cclxuXHRcdFx0c3RlcENvdW50KytcclxuXHJcblx0XHRfZW5kID0gKHN1Y2Nlc3MpID0+XHJcblx0XHRcdEBmaW5pc2hlZCA9IHRydWVcclxuXHRcdFx0QGlzUnVubmluZyA9IGZhbHNlXHJcblxyXG5cdFx0XHRAcmVzdWx0LnN1Y2Nlc3MgPSBzdWNjZXNzXHJcblx0XHRcdEByZXN1bHQudGltZSA9IE1hdGgucm91bmQoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgKyAnbXMnXHJcblx0XHRcdEByZXN1bHQuc3RlcCA9IHN0ZXBDb3VudFxyXG5cclxuXHRcdFx0QHRyaWdnZXIgJ2ZpbmlzaGVkJywgQHJlc3VsdFxyXG5cclxuXHJcblx0XHRjb21wYXJlTm9kZXMgPSAobm9kZTEsIG5vZGUyKSAtPlxyXG5cdFx0XHRkZWx0YSA9IG5vZGUxLmYoKSAtIG5vZGUyLmYoKVxyXG5cdFx0XHQjIHdpdGhvdXQgdGhpcyBzdGVwIGl0IHdpbGwgc2hvd3Mgc29tZSByYW5kb20gd2hpY2ggc2VlbXMgc3R1cGlkXHJcblx0XHRcdGRlbHRhID0gbm9kZTIuaWQgLSAobm9kZTEuaWQpIGlmIGRlbHRhID09IDBcclxuXHRcdFx0cmV0dXJuIGRlbHRhXHJcblxyXG5cdFx0cmVjYWxjdWxhdGVMYXN0Tm9kZSA9IChub2RlKSA9PlxyXG5cdFx0XHRuZWlnaGJvdXJzID0gX25ldC5nZXROZWlnaGJvdXJzT2Yobm9kZSlcclxuXHJcblx0XHRcdCMgZGV0ZWN0IGZyb20gaXRzIG5laWdoYm91cnMgdG8gc2VlIHdoZXRoZXIgdGhlcmUgaXMgYSBuZWFyZXIgbm9kZSB0byBiZSBpdHMgcGFyZW50IG5vZGVcclxuXHRcdFx0Zm9yIG93biBpIG9mIG5laWdoYm91cnNcclxuXHRcdFx0XHRuZWlnaGJvdXIgPSBuZWlnaGJvdXJzW2ldXHJcblx0XHRcdFx0IyByZWFjaGVkIG5vZGVzOiBzdGFydCBub2RlLCBiZWluZyByZWFjaGluZywgaGFzIHJlYWNoZWRcclxuXHRcdFx0XHRpZiBuZWlnaGJvdXIuc3RhdGUgPiBBU3Rhci5OT0RFX1NUQVRFX0RFRkFVTFQgYW5kIG5laWdoYm91ci5zdGF0ZSA8IEFTdGFyLk5PREVfU1RBVEVfT0JTVEFDTEUgYW5kIG5laWdoYm91ci5zdGF0ZSAhPSBBU3Rhci5OT0RFX1NUQVRFX0VORFxyXG5cclxuXHRcdFx0XHRcdGcwID0gbm9kZS5nXHJcblx0XHRcdFx0XHRnMSA9IG5laWdoYm91ci5nICsgbm9kZS5jYWxjU2hvcnRlc3REaXN0YW5jZVRvKG5laWdoYm91cilcclxuXHRcdFx0XHRcdGlmIGcwID4gZzFcclxuXHRcdFx0XHRcdFx0bm9kZS5wcmV2Tm9kZSA9IG5laWdoYm91clxyXG5cdFx0XHRcdFx0XHRub2RlLmcgPSBnMVxyXG5cdFx0XHRcdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBub2RlLnBvc2l0aW9uXHJcblxyXG5cdFx0IyB0cmFjZSB0aGUgc2hvcnRlc3QgcGF0aCBhbmQgY2hhbmdlIHRoZSBzdGF0ZSBmcm9tIERFVEVDVEVEIHRvIFNIT1JURVNUXHJcblx0XHR0cmFjZVNob3J0ZXN0UGF0aCA9ID0+XHJcblx0XHRcdG1pZGRsZU5vZGUgPSBfbmV0LmVuZE5vZGUucHJldk5vZGVcclxuXHJcblx0XHRcdHdoaWxlIG1pZGRsZU5vZGUgIT0gX25ldC5zdGFydE5vZGVcclxuXHRcdFx0XHRtaWRkbGVOb2RlLnN0YXRlID0gQVN0YXIuTk9ERV9TVEFURV9TSE9SVEVTVFxyXG5cclxuXHRcdFx0XHRAdHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBtaWRkbGVOb2RlLnBvc2l0aW9uXHJcblx0XHRcdFx0bWlkZGxlTm9kZSA9IG1pZGRsZU5vZGUucHJldk5vZGVcclxuIl19
