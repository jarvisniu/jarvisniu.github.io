// Generated by CoffeeScript 1.10.0

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
 */
var hasProp = {}.hasOwnProperty;

AStar.Engine = function(net) {
  var FPS, _net, _step, autoStep, compareNodes, finished, init, listClose, listOpen, nodeId, recalculateLastNode, self, stepCount, traceShortestPath;
  Bu.Event.apply(this);
  self = this;
  _net = net;
  finished = false;
  FPS = 10;
  listOpen = [];
  listClose = [];
  nodeId = 0;
  stepCount = 0;
  this.noSolution = false;
  this.result = {};
  init = function() {
    listOpen = [];
    listClose = [];
    _net.startNode.g = 0;
    _net.startNode.h = parseInt(_net.calcShortestDistance(_net.startNode, _net.endNode));
    self.trigger('nodeChanged', _net.startNode.position);
    return listOpen.push(_net.startNode);
  };
  this.step = function() {
    if (!finished) {
      _step();
    } else {
      console.log('It has been finished.');
    }
  };
  this.run = function(fps) {
    FPS = fps || FPS;
    if (fps) {
      autoStep();
    } else {
      while (!finished) {
        _step();
      }
    }
  };
  autoStep = function() {
    if (!finished) {
      _step();
      setTimeout(autoStep, 1000 / FPS);
    }
  };
  _step = function() {
    var currentNode, i, neighbour, neighbours;
    if (self.noSolution) {
      return;
    }
    if (listOpen.length === 0) {
      init();
    }
    currentNode = listOpen.shift();
    if (currentNode === void 0) {
      self.noSolution = true;
      finished = true;
      self.trigger('finish', self.result);
      self.trigger('noSolution', self.result);
      return;
    }
    if (currentNode.state !== AStar.NODE_STATE_START) {
      currentNode.state = AStar.NODE_STATE_DETECTED;
      self.trigger('nodeChanged', currentNode.position);
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
        self.trigger('nodeChanged', neighbour.position);
        recalculateLastNode(neighbour);
        listOpen.push(neighbour);
      }
    }
    listOpen.sort(compareNodes);
    if (listOpen[0] === _net.endNode) {
      _net.endNode.state = AStar.NODE_STATE_END;
      self.trigger('nodeChanged', _net.endNode.position);
      traceShortestPath();
      finished = true;
      self.trigger('finish', self.result);
      self.trigger('reachEnd', stepCount);
    }
    stepCount++;
  };
  compareNodes = function(node1, node2) {
    var delta;
    delta = node1.f() - node2.f();
    if (delta === 0) {
      delta = node2.id - node1.id;
    }
    return delta;
  };
  recalculateLastNode = function(node) {
    var g0, g1, i, neighbour, neighbours;
    neighbours = _net.getNeighboursOf(node);
    for (i in neighbours) {
      if (!hasProp.call(neighbours, i)) continue;
      neighbour = neighbours[i];
      if (neighbour.state > AStar.NODE_STATE_DEFAULT && neighbour.state < AStar.NODE_STATE_OBSTACLE && neighbour.state !== AStar.NODE_STATE_END) {
        g0 = node.g;
        g1 = neighbour.g + node.calcShortestDistanceTo(neighbour);
        if (g0 > g1) {
          node.prevNode = neighbour;
          node.g = g1;
          self.trigger('nodeChanged', node.position);
        }
      }
    }
  };
  traceShortestPath = function() {
    var count, middleNode;
    middleNode = _net.endNode.prevNode;
    count = 0;
    while (middleNode !== _net.startNode && count < 100) {
      middleNode.state = AStar.NODE_STATE_SHORTEST;
      self.trigger('nodeChanged', middleNode.position);
      middleNode = middleNode.prevNode;
      count++;
    }
  };
};

//# sourceMappingURL=Engine.js.map
