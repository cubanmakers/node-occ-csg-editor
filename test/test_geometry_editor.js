const should = require("should");

const geometry_editor = require("../lib/geometry_editor");
const GeometryEditor = geometry_editor.GeometryEditor;
const GeomPrimitiveBox = geometry_editor.GeomPrimitiveBox;
const GeomPrimitiveCylinder = geometry_editor.GeomPrimitiveCylinder;
const GeomPrimitiveCone = geometry_editor.GeomPrimitiveCone;


const GeomOperationCut = geometry_editor.GeomOperationCut;

describe("Testing GeometryEditor", function () {


    it("should create a empty geometry editor", function () {

        const geometryEditor = new GeometryEditor();

        geometryEditor.elements.length.should.eql(0);

    });

    it("should create a sequence of geometric item in the editor", function () {

        const geometryEditor = new GeometryEditor();


        const box1 = geometryEditor.addBox();
        box1.should.be.instanceOf(GeomPrimitiveBox);

        geometryEditor.elements.length.should.eql(1);

        box1.point1.X.set(0);
        box1.point1.Y.set(0);
        box1.point1.Z.set(0);

        box1.point2.X.set("sin(30)*100");
        box1.point2.Y.set("100+20");
        box1.point2.Z.set("100");
    });

});


describe("Testing GeometryEditor can be converted to script", function () {

    function buildDemoObjectWithBox() {
        const geometryEditor = new GeometryEditor();
        const box1 = geometryEditor.addBox();
        box1.point1.X.set(0);
        box1.point1.Y.set(0);
        box1.point1.Z.set(0);

        box1.point2.X.set("100");
        box1.point2.Y.set("110");
        box1.point2.Z.set("120");
        return geometryEditor;
    }

    function buildDemoObjectWithCylinder() {
        const geometryEditor = new GeometryEditor();
        const cyl1 = geometryEditor.addCylinder();
        cyl1.point1.X.set(0);
        cyl1.point1.Y.set(0);
        cyl1.point1.Z.set(0);

        cyl1.point2.X.set(100);
        cyl1.point2.Y.set(110);
        cyl1.point2.Z.set(120);

        cyl1.radius.set(50);
        return geometryEditor;
    }

    function buildDemoObjectWithCone() {
        const geometryEditor = new GeometryEditor();
        const cone = geometryEditor.addCone();
        cone.point1.X.set(0);
        cone.point1.Y.set(0);
        cone.point1.Z.set(0);
        cone.radius1.set(100);

        cone.point2.X.set(0);
        cone.point2.Y.set(0);
        cone.point2.Z.set(120);
        cone.radius1.set(10);
        return geometryEditor;
    }

    function buildDemoObjectWithSphere() {
        const geometryEditor = new GeometryEditor();
        const sphere = geometryEditor.addSphere();
        sphere.center.X.set(10);
        sphere.center.Y.set(20);
        sphere.center.Z.set(30);
        sphere.radius.set(100);
        return geometryEditor;
    }

    function buildDemoObjectWithTorus() {
        const geometryEditor = new GeometryEditor();
        const sphere = geometryEditor.addTorus();
        sphere.center.X.set(10);
        sphere.center.Y.set(20);
        sphere.center.Z.set(30);
        sphere.axis.X.set(0);
        sphere.axis.Y.set(1.0);
        sphere.axis.Z.set(0);
        sphere.mainRadius.set(100);
        sphere.smallRadius.set(10);
        return geometryEditor;
    }

    function buildDemoObjectCutBoxes() {

        const geometryEditor = new GeometryEditor();
        const box1 = geometryEditor.addBox();
        box1.point1.X.set(0);
        box1.point1.Y.set(0);
        box1.point1.Z.set(0);

        box1.point2.X.set(100);
        box1.point2.Y.set(100);
        box1.point2.Z.set(100);

        const box2 = geometryEditor.addBox();
        box2.point1.X.set(10);
        box2.point1.Y.set(10);
        box2.point1.Z.set(10);

        box2.point2.X.set(90);
        box2.point2.Y.set(90);
        box2.point2.Z.set(150);

        const cut = geometryEditor.addCutOperation();

        cut.leftArg.set(box1);
        cut.rightArg.set(box2);

        return geometryEditor;

    }

    function buildDemoObjectWithRotate() {
        const geometryEditor = buildDemoObjectCutBoxes();

        const lastBox = geometryEditor.elements[geometryEditor.elements.length - 1];

        const rotation = geometryEditor.addRotation();
        rotation.setGeometry(lastBox);

        rotation.center.set(0, 0, 0);
        rotation.axis.set(0, 0, 1);
        rotation.angle.set("Math.PI/2.0");

        return geometryEditor;
    }

    function buildDemoObjectWithTranslate() {
        const geometryEditor = buildDemoObjectCutBoxes();

        const lastBox = geometryEditor.elements[geometryEditor.elements.length - 1];

        const rotation = geometryEditor.addTranslation();
        rotation.setGeometry(lastBox);
        rotation.vector.set(10, 20, 30);

        return geometryEditor;
    }


    it("should create a script for a simple box", function () {
        const g1 = buildDemoObjectWithBox();
        const script = g1.convertToScript();
        script.should.match("var shape0 = csg.makeBox([0,0,0],[100,110,120]);");
    });
    it("should create a script for a simple cylinder", function () {
        const g1 = buildDemoObjectWithCylinder();
        const script = g1.convertToScript();
        script.should.match("var shape0 = csg.makeCylinder([0,0,0],[100,110,120],50);");
    });

    it("should create a script for a cut operation ", function () {
        const g1 = buildDemoObjectCutBoxes();
        const script = g1.convertToScript();
        script.split("\n").should.eql([
            "var shape0 = csg.makeBox([0,0,0],[100,100,100]);",
            "var shape1 = csg.makeBox([10,10,10],[90,90,150]);",
            "var shape2 = csg.cut(shape0,shape1);"
        ]);

        const shape1 = g1.elements[0];
        const shape2 = g1.elements[1];
        const shape3 = g1.elements[2];

        shape1.getDependantShapes().length.should.eql(1);
        shape2.getDependantShapes().length.should.eql(1);
        shape3.getDependantShapes().length.should.eql(0);

    });


    it("should propose list of possible ancestors", function () {

        const g1 = buildDemoObjectCutBoxes();

        g1.getPossibleAncestors(g1.elements[0]).length.should.eql(0);
        g1.getPossibleAncestors(g1.elements[1]).length.should.eql(1);
        g1.getPossibleAncestors(g1.elements[2]).length.should.eql(2);
    });


    it("should create a script for a rotated geometry", function () {

        const g1 = buildDemoObjectWithRotate();
        const script = g1.convertToScript();

        script.split("\n").should.eql([
            "var shape0 = csg.makeBox([0,0,0],[100,100,100]);",
            "var shape1 = csg.makeBox([10,10,10],[90,90,150]);",
            "var shape2 = csg.cut(shape0,shape1);",
            "var shape3 = shape2.rotate([0,0,0],[0,0,1],Math.PI/2.0);"
        ]);

    });
    it("should create a script for a translated geometry", function () {

        const g1 = buildDemoObjectWithTranslate();
        const script = g1.convertToScript();

        script.split("\n").should.eql([
            "var shape0 = csg.makeBox([0,0,0],[100,100,100]);",
            "var shape1 = csg.makeBox([10,10,10],[90,90,150]);",
            "var shape2 = csg.cut(shape0,shape1);",
            "var shape3 = shape2.translate([10,20,30]);"
        ]);

    });

    function serialize(g1) {

        return GeometryEditor.serialize(g1);

    }

    function deserialized(str) {
        return GeometryEditor.deserialize(str);
    }

    it("should serialize a GeometryEditor structure into JSON and back to GeometryEditor", function () {
        // this is important because  GeometryEditor will exists as text inside NarmerStudies
        // and will be transferred as text to the client browser. GeometryEditor will have to be
        // manipulated as complex Javascript objcet on Server and Client and  between the two.

        //POJO = { "a": 1 }
        // var str = pojo.toJSON();
        // var pojo = JSON.parse(str);

        const g1 = buildDemoObjectCutBoxes();

        const str = serialize(g1);
        (typeof str).should.eql("string");

        const g2 = deserialized(str);

        g1.should.be.instanceOf(GeometryEditor);
        g1.elements.length.should.eql(3);
        g1.elements[0].should.be.instanceOf(GeomPrimitiveBox);
        g1.elements[1].should.be.instanceOf(GeomPrimitiveBox);
        g1.elements[2].should.be.instanceOf(GeomOperationCut);

        g2.should.be.instanceOf(GeometryEditor);
        g2.elements.length.should.eql(3);
        g2.elements[0].should.be.instanceOf(GeomPrimitiveBox);
        g2.elements[1].should.be.instanceOf(GeomPrimitiveBox);
        g2.elements[2].should.be.instanceOf(GeomOperationCut);
    });


    describe("Clone", function () {

        it("should clone a Box", function () {

            const g1 = buildDemoObjectWithBox();
            const shape = g1.elements[0];
            shape.should.be.instanceof(GeomPrimitiveBox);
            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
            should(cloned_shape._id).eql(null);

        });
        it("should clone a Cylinder", function () {

            const g1 = buildDemoObjectWithCylinder();
            const shape = g1.elements[0];
            shape.should.be.instanceof(GeomPrimitiveCylinder);
            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });
        it("should clone a Cone", function () {

            const g1 = buildDemoObjectWithCone();
            const shape = g1.elements[0];
            shape.should.be.instanceof(GeomPrimitiveCone);
            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });

        it("should clone a Sphere", function () {

            const g1 = buildDemoObjectWithSphere();
            const shape = g1.elements[0];
            shape.should.be.instanceof(geometry_editor.GeomPrimitiveSphere);
            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });
        it("should clone a Torus", function () {

            const g1 = buildDemoObjectWithTorus();
            const shape = g1.elements[0];
            shape.should.be.instanceof(geometry_editor.GeomPrimitiveTorus);
            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });

        it("should clone a Cut Operation", function () {

            const g1 = buildDemoObjectCutBoxes();
            const shape = g1.elements[2];
            shape.should.be.instanceof(geometry_editor.GeomOperationCut);
            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });

        it("should clone a Rotate Transformation", function () {

            const g1 = buildDemoObjectWithRotate();
            const shape = g1.elements[3];
            shape.should.be.instanceof(geometry_editor.GeomTransfoRotate);

            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });

        it("should clone a Translate Transformation", function () {

            const g1 = buildDemoObjectWithTranslate();
            const shape = g1.elements[3];
            shape.should.be.instanceof(geometry_editor.GeomTransfoTranslate);

            const cloned_shape = shape.clone();

            cloned_shape.toString().should.eql(shape.toString());
        });
    });

    it("should edit and replace an element in the tree", function () {
        const g1 = buildDemoObjectCutBoxes();
        const shape = g1.elements[2];
        shape.should.be.instanceof(geometry_editor.GeomOperationCut);

        const cloned_shape = shape.clone();
        should(cloned_shape._id).eql(null);

        const possibleAncestors = g1.getPossibleAncestors(shape);

        // now item is edited
        cloned_shape.leftArg.set(possibleAncestors[1]);
        cloned_shape.rightArg.set(possibleAncestors[0]);

        g1.replaceItem(2, cloned_shape);

    });

    it("should delete the last element (by shape)", function () {
        const g1 = buildDemoObjectCutBoxes();
        const shape = g1.elements[2];

        g1.elements[0].getDependantShapes().length.should.eql(1);
        g1.elements[1].getDependantShapes().length.should.eql(1);
        g1.elements.length.should.eql(3);
        g1.deleteItem(shape);
        g1.elements.length.should.eql(2);
        g1.elements[0].getDependantShapes().length.should.eql(0);
        g1.elements[1].getDependantShapes().length.should.eql(0);

    });

    it("should delete the last element (by index)", function () {
        const g1 = buildDemoObjectCutBoxes();

        g1.elements[0].getDependantShapes().length.should.eql(1);
        g1.elements[1].getDependantShapes().length.should.eql(1);
        g1.canDelete(0).should.eql(false);
        g1.canDelete(1).should.eql(false);
        g1.canDelete(2).should.eql(true);

        g1.elements.length.should.eql(3);
        g1.deleteItem(2);

        g1.elements.length.should.eql(2);
        g1.elements[0].getDependantShapes().length.should.eql(0);
        g1.elements[1].getDependantShapes().length.should.eql(0);
        g1.canDelete(0).should.eql(true);
        g1.canDelete(1).should.eql(true);

    });

    it("should propagate name change to dependant entity links", function () {

        const g1 = buildDemoObjectCutBoxes();
        g1.elements[2].toScript().should.eql("csg.cut(shape0,shape1);");

        // we should verify that element 0 is dependant
        g1.elements[0].getDependantShapes().length.should.be.greaterThan(0);


        // simulate name change in editor on ELEMENT 0
        const shape = g1.elements[0];
        const cloned = shape.clone();
        cloned.name.should.eql("shape0");
        cloned.name = "NEWNAME";

        g1.replaceItem(0, cloned);

        // we should verify that element 0 has remained dependant
        g1.elements[0].getDependantShapes().length.should.be.greaterThan(0);

        g1.elements[2].toScript().should.eql("csg.cut(NEWNAME,shape1);");

    });

    it("GeomBase should provide a list of shape connectors", function () {
        const g1 = buildDemoObjectWithRotate();
        g1.elements[0].getShapeConnectors().length.should.eql(0);
        g1.elements[1].getShapeConnectors().length.should.eql(0);

        // cut element
        g1.elements[2].getShapeConnectors().length.should.eql(2);
        g1.elements[2].getShapeConnectors()[0].should.equal(g1.elements[2].leftArg);
        g1.elements[2].getShapeConnectors()[1].should.equal(g1.elements[2].rightArg);

        g1.elements[3].getShapeConnectors().length.should.eql(1);
        g1.elements[3].getShapeConnectors()[0].should.equal(g1.elements[3].geometry);

    });

    it("should handle inconsistent shapes links", function () {

        const g1 = buildDemoObjectCutBoxes();
        g1.elements[2].toScript().should.eql("csg.cut(shape0,shape1);");

        // we should verify that element 0 is dependant
        g1.elements[0].getDependantShapes().length.should.be.greaterThan(0);


        // simulate name change in editor on ELEMENT 0
        const shape = g1.elements[2];
        const cloned = shape.clone();
        cloned.name.should.eql("shape2");

        const tmp1 = cloned.leftArg.get();
        tmp1.name.should.eql("shape0");
        const tmp2 = cloned.rightArg.get();
        tmp2.name.should.eql("shape1");

        // try to set csg.cut to "shape0","shape0"
        cloned.rightArg.set(tmp1);

        // now commit the change -> this should throw
        should.throws(function () {
            g1.replaceItem(2, cloned);
        });

        const errorList = [];
        g1.checkReplaceItem(2, cloned, errorList).should.eql(false);
        errorList.should.eql([
            "a link duplication has been found : shape0 is referenced twice by the entity"
        ]);

        // try to set csg.cut to "shape1","shape0"
        cloned.leftArg.set(tmp2);

        const errorList2 = [];
        g1.checkReplaceItem(2, cloned, errorList2).should.eql(true);
        errorList2.length.should.eql(0, "Expecting no error");

        // now commit the change -> this should be OK
        g1.replaceItem(2, cloned);


        // we should verify that element 0 has remained dependant
        g1.elements[0].getDependantShapes().length.should.be.greaterThan(0);

        g1.elements[2].toScript().should.eql("csg.cut(shape1,shape0);");

    });
});