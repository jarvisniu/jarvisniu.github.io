
/**
 * NetGrid - a net consists of square blocks.
 * @param w - Width of the grid net.
 * @param h - Height of the grid net.
 * @constructor
 */

(function() {
  AStar.NetGrid = function(w, h) {
    var _self;
    _self = this;
    this.engine = null;
    this.width = w || 20;
    this.height = h || 10;
    this.count = this.width * this.height;
    this.nodes = [];
    this.startNode = null;
    this.endNode = null;
    this.setStart = function(x, y) {
      var node;
      node = this.getNode(x, y);
      this.startNode = node;
      node.state = AStar.NODE_STATE_START;
      this.engine.trigger('nodeChanged', node.position);
    };
    this.setEnd = function(x, y) {
      var node;
      node = this.getNode(x, y);
      this.endNode = node;
      node.state = AStar.NODE_STATE_END;
      this.engine.trigger('nodeChanged', node.position);
    };
    this.getNode = function(x, y) {
      var base;
      (base = this.nodes)[x] || (base[x] = []);
      if (this.nodes[x][y] == null) {
        this.nodes[x][y] = new AStar.Node(this);
        this.nodes[x][y].position.x = x;
        this.nodes[x][y].position.y = y;
      }
      return this.nodes[x][y];
    };
    this.getNeighboursOf = function(node) {
      var i, j, k, l, neighbour, ref, ref1, ref2, ref3, x, xFrom, xTo, y, yFrom, yTo;
      if (node.neighbours) {
        return node.neighbours;
      }
      x = node.position.x;
      y = node.position.y;
      xFrom = x - 1;
      xTo = x + 1;
      yFrom = y - 1;
      yTo = y + 1;
      if (xFrom < 0) {
        xFrom = 0;
      }
      if (xFrom > this.width - 1) {
        xFrom = this.width - 1;
      }
      if (xTo < 0) {
        xTo = 0;
      }
      if (xTo > this.width - 1) {
        xTo = this.width - 1;
      }
      if (yFrom < 0) {
        yFrom = 0;
      }
      if (yFrom > this.height - 1) {
        yFrom = this.height - 1;
      }
      if (yTo < 0) {
        yTo = 0;
      }
      if (yTo > this.height - 1) {
        yTo = this.height - 1;
      }
      node.neighbours = [];
      for (i = k = ref = xFrom, ref1 = xTo; ref <= ref1 ? k <= ref1 : k >= ref1; i = ref <= ref1 ? ++k : --k) {
        for (j = l = ref2 = yFrom, ref3 = yTo; ref2 <= ref3 ? l <= ref3 : l >= ref3; j = ref2 <= ref3 ? ++l : --l) {
          neighbour = this.getNode(i, j);
          if (i === x && j === y) {
            continue;
          }
          if (neighbour.state === AStar.NODE_STATE_OBSTACLE) {
            continue;
          }
          if ((i - x) * (j - y) !== 0) {
            if (this.getNode(x, j).state === AStar.NODE_STATE_OBSTACLE || this.getNode(i, y).state === AStar.NODE_STATE_OBSTACLE) {
              continue;
            }
          }
          node.neighbours.push(neighbour);
        }
      }
      return node.neighbours;
    };
    this.calcShortestDistance = function(node1, node2) {
      var distance, dx, dy;
      dx = Math.abs(node1.position.x - node2.position.x);
      dy = Math.abs(node1.position.y - node2.position.y);
      distance = Math.abs(dx - dy) + Math.min(dx, dy) * 1.414;
      return distance;
    };
    return this;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,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dkIsVUFBQTtNQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFvQixLQUFLLENBQUMsUUFBUSxDQUFDLENBQTVDO01BQ0wsRUFBQSxHQUFLLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFmLEdBQW9CLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBNUM7TUFFTCxRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFBLEdBQUssRUFBZCxDQUFBLEdBQW9CLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxFQUFhLEVBQWIsQ0FBQSxHQUFtQjtBQUVsRCxhQUFPO0lBTmdCO0FBT3hCLFdBQU87RUF0RlE7QUFQaEIiLCJmaWxlIjoiYS1zdGFyL05ldEdyaWQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIyMqXHJcbiMgTmV0R3JpZCAtIGEgbmV0IGNvbnNpc3RzIG9mIHNxdWFyZSBibG9ja3MuXHJcbiMgQHBhcmFtIHcgLSBXaWR0aCBvZiB0aGUgZ3JpZCBuZXQuXHJcbiMgQHBhcmFtIGggLSBIZWlnaHQgb2YgdGhlIGdyaWQgbmV0LlxyXG4jIEBjb25zdHJ1Y3RvclxyXG4jIyNcclxuXHJcbkFTdGFyLk5ldEdyaWQgPSAodywgaCkgLT5cclxuXHRfc2VsZiA9IHRoaXNcclxuXHRAZW5naW5lID0gbnVsbFxyXG5cclxuXHRAd2lkdGggPSB3IG9yIDIwXHJcblx0QGhlaWdodCA9IGggb3IgMTBcclxuXHRAY291bnQgPSBAd2lkdGggKiBAaGVpZ2h0XHJcblxyXG5cdEBub2RlcyA9IFtdXHJcblxyXG5cdCMgZm9yIGVuZ2luZVxyXG5cdEBzdGFydE5vZGUgPSBudWxsXHJcblx0QGVuZE5vZGUgPSBudWxsXHJcblxyXG5cdCMgc2V0dGVyc1xyXG5cclxuXHRAc2V0U3RhcnQgPSAoeCwgeSkgLT5cclxuXHRcdG5vZGUgPSBAZ2V0Tm9kZSh4LCB5KVxyXG5cdFx0QHN0YXJ0Tm9kZSA9IG5vZGVcclxuXHRcdG5vZGUuc3RhdGUgPSBBU3Rhci5OT0RFX1NUQVRFX1NUQVJUXHJcblx0XHRAZW5naW5lLnRyaWdnZXIgJ25vZGVDaGFuZ2VkJywgbm9kZS5wb3NpdGlvblxyXG5cdFx0cmV0dXJuXHJcblxyXG5cdEBzZXRFbmQgPSAoeCwgeSkgLT5cclxuXHRcdG5vZGUgPSBAZ2V0Tm9kZSh4LCB5KVxyXG5cdFx0QGVuZE5vZGUgPSBub2RlXHJcblx0XHRub2RlLnN0YXRlID0gQVN0YXIuTk9ERV9TVEFURV9FTkRcclxuXHRcdEBlbmdpbmUudHJpZ2dlciAnbm9kZUNoYW5nZWQnLCBub2RlLnBvc2l0aW9uXHJcblx0XHRyZXR1cm5cclxuXHJcblx0IyBnZXR0ZXJzXHJcblxyXG5cdEBnZXROb2RlID0gKHgsIHkpIC0+XHJcblx0XHRAbm9kZXNbeF0gb3I9IFtdXHJcblx0XHRpZiBub3QgQG5vZGVzW3hdW3ldP1xyXG5cdFx0XHRAbm9kZXNbeF1beV0gPSBuZXcgQVN0YXIuTm9kZSB0aGlzXHJcblx0XHRcdEBub2Rlc1t4XVt5XS5wb3NpdGlvbi54ID0geFxyXG5cdFx0XHRAbm9kZXNbeF1beV0ucG9zaXRpb24ueSA9IHlcclxuXHRcdEBub2Rlc1t4XVt5XVxyXG5cclxuXHRAZ2V0TmVpZ2hib3Vyc09mID0gKG5vZGUpIC0+XHJcblx0XHRyZXR1cm4gbm9kZS5uZWlnaGJvdXJzIGlmIG5vZGUubmVpZ2hib3Vyc1xyXG5cclxuXHRcdHggPSBub2RlLnBvc2l0aW9uLnhcclxuXHRcdHkgPSBub2RlLnBvc2l0aW9uLnlcclxuXHJcblx0XHR4RnJvbSA9IHggLSAxXHJcblx0XHR4VG8gPSB4ICsgMVxyXG5cclxuXHRcdHlGcm9tID0geSAtIDFcclxuXHRcdHlUbyA9IHkgKyAxXHJcblxyXG5cclxuXHRcdHhGcm9tID0gMCBpZiB4RnJvbSA8IDBcclxuXHRcdHhGcm9tID0gQHdpZHRoIC0gMSBpZiB4RnJvbSA+IEB3aWR0aCAtIDFcclxuXHRcdHhUbyA9IDAgaWYgeFRvIDwgMFxyXG5cdFx0eFRvID0gQHdpZHRoIC0gMSBpZiB4VG8gPiBAd2lkdGggLSAxXHJcblxyXG5cdFx0eUZyb20gPSAwIGlmIHlGcm9tIDwgMFxyXG5cdFx0eUZyb20gPSBAaGVpZ2h0IC0gMSAgaWYgeUZyb20gPiBAaGVpZ2h0IC0gMVxyXG5cdFx0eVRvID0gMCBpZiB5VG8gPCAwXHJcblx0XHR5VG8gPSBAaGVpZ2h0IC0gMSBpZiB5VG8gPiBAaGVpZ2h0IC0gMVxyXG5cclxuXHRcdG5vZGUubmVpZ2hib3VycyA9IFtdXHJcblxyXG5cdFx0Zm9yIGkgaW4gW3hGcm9tLi54VG9dXHJcblx0XHRcdGZvciBqIGluIFt5RnJvbS4ueVRvXVxyXG5cdFx0XHRcdG5laWdoYm91ciA9IEBnZXROb2RlKGksIGopXHJcblx0XHRcdFx0IyBub3QgaXRzZWxmXHJcblx0XHRcdFx0Y29udGludWUgaWYgaSA9PSB4IGFuZCBqID09IHlcclxuXHRcdFx0XHQjIG5vdCBvYnN0YWNsZVxyXG5cdFx0XHRcdGNvbnRpbnVlIGlmIG5laWdoYm91ci5zdGF0ZSA9PSBBU3Rhci5OT0RFX1NUQVRFX09CU1RBQ0xFXHJcblx0XHRcdFx0IyBXaGVuIG1vdmUgb24gdGhlIGRpYWdvbmFscywgZm91ciBibG9ja3MgbXVzdCBiZSBhbGwgcmVhY2hhYmxlLlxyXG5cdFx0XHRcdGlmIChpIC0geCkgKiAoaiAtIHkpICE9IDBcclxuXHRcdFx0XHRcdGNvbnRpbnVlIGlmIEBnZXROb2RlKHgsIGopLnN0YXRlID09IEFTdGFyLk5PREVfU1RBVEVfT0JTVEFDTEUgb3IgQGdldE5vZGUoaSwgeSkuc3RhdGUgPT0gQVN0YXIuTk9ERV9TVEFURV9PQlNUQUNMRVxyXG5cclxuXHRcdFx0XHRub2RlLm5laWdoYm91cnMucHVzaCBuZWlnaGJvdXJcclxuXHRcdG5vZGUubmVpZ2hib3Vyc1xyXG5cclxuXHRAY2FsY1Nob3J0ZXN0RGlzdGFuY2UgPSAobm9kZTEsIG5vZGUyKSAtPlxyXG5cdFx0ZHggPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi54IC0gKG5vZGUyLnBvc2l0aW9uLngpKVxyXG5cdFx0ZHkgPSBNYXRoLmFicyhub2RlMS5wb3NpdGlvbi55IC0gKG5vZGUyLnBvc2l0aW9uLnkpKVxyXG5cclxuXHRcdGRpc3RhbmNlID0gTWF0aC5hYnMoZHggLSBkeSkgKyBNYXRoLm1pbihkeCwgZHkpICogMS40MTRcclxuXHJcblx0XHRyZXR1cm4gZGlzdGFuY2VcclxuXHRyZXR1cm4gdGhpcyJdfQ==
