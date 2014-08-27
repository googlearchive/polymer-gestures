(function(scope) {
  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var pointermap = new scope.PointerMap();
  var RAD_TO_DEG = 180 / Math.PI;
  var pinch = {
    events: [
      'down',
      'up',
      'move',
      'cancel'
    ],
    exposes: [
      'pinch',
      'rotate'
    ],
    reference: {},
    down: function(inEvent) {
      pointermap.set(inEvent.pointerId, inEvent);
      if (pointermap.pointers() == 2) {
        var points = this.calcChord();
        var angle = this.calcAngle(points);
        this.reference = {
          angle: angle,
          diameter: points.diameter,
          target: scope.targetFinding.LCA(points.a.target, points.b.target)
        };
      }
    },
    up: function(inEvent) {
      var p = pointermap.get(inEvent.pointerId);
      if (p) {
        pointermap.delete(inEvent.pointerId);
      }
    },
    move: function(inEvent) {
      if (pointermap.has(inEvent.pointerId)) {
        pointermap.set(inEvent.pointerId, inEvent);
        if (pointermap.pointers() > 1) {
          this.calcPinchRotate();
        }
      }
    },
    cancel: function(inEvent) {
        this.up(inEvent);
    },
    dispatchPinch: function(diameter, points) {
      var zoom = diameter / this.reference.diameter;
      var e = eventFactory.makeGestureEvent('pinch', {
        scale: zoom,
        centerX: points.center.x,
        centerY: points.center.y
      });
      this.reference.target.dispatchEvent(e);
    },
    dispatchRotate: function(angle, points) {
      var diff = Math.round((angle - this.reference.angle) % 360);
      var e = eventFactory.makeGestureEvent('rotate', {
        angle: diff,
        centerX: points.center.x,
        centerY: points.center.y
      });
      this.reference.target.dispatchEvent(e);
    },
    calcPinchRotate: function() {
      var points = this.calcChord();
      var diameter = points.diameter;
      var angle = this.calcAngle(points);
      if (diameter != this.reference.diameter) {
        this.dispatchPinch(diameter, points);
      }
      if (angle != this.reference.angle) {
        this.dispatchRotate(angle, points);
      }
    },
    calcChord: function() {
      var pointers = [];
      pointermap.forEach(function(p) {
        pointers.push(p);
      });
      var dist = 0;
      // start with at least two pointers
      var points = {a: pointers[0], b: pointers[1]};
      var x, y, d;
      for (var i = 0; i < pointers.length; i++) {
        var a = pointers[i];
        for (var j = i + 1; j < pointers.length; j++) {
          var b = pointers[j];
          x = Math.abs(a.clientX - b.clientX);
          y = Math.abs(a.clientY - b.clientY);
          d = x + y;
          if (d > dist) {
            dist = d;
            points = {a: a, b: b};
          }
        }
      }
      x = Math.abs(points.a.clientX + points.b.clientX) / 2;
      y = Math.abs(points.a.clientY + points.b.clientY) / 2;
      points.center = { x: x, y: y };
      points.diameter = dist;
      return points;
    },
    calcAngle: function(points) {
      var x = points.a.clientX - points.b.clientX;
      var y = points.a.clientY - points.b.clientY;
      return (360 + Math.atan2(y, x) * RAD_TO_DEG) % 360;
    }
  };
  dispatcher.registerGesture('pinch', pinch);
})(window.PolymerGestures);
