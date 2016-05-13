

var connection_seed = '100.76.4.163';
var connection_port = '5000';

var wrong_c_c   = 47973;
var correct_c_c = 63909;

/*------------------------------------------------------
* Centralized
*/
describe('Centralized dependencies' , function() {
    /*------------------------------------------------------
    * Hooks
    */
    describe('Hooks' , function() {
        describe('Custom client hooks' , function() {
            it('Should pass as function only expects objects', function(){
                var Hooks = new cwc.Hooks({ });
                Hooks.set_hook();
                expect( Hooks.all_hooks ).to.be.empty();
            });

            it('Should not add hook as no name was given', function(){
                var Hooks = new cwc.Hooks({ });
                Hooks.set_hook({
                    'method'    : function(){ }
                });
                expect( Hooks.all_hooks ).to.be.empty();
            });

            it('Should not add hook as no method pram was given', function(){
                var Hooks = new cwc.Hooks({ });
                Hooks.set_hook({
                    'hook_name' : '',
                    'method'    : function(){ }
                });
                console.log( Hooks.all_hooks );
                expect( Hooks.all_hooks ).to.be.empty();
            });

            it('Should not add hook as no method pram was given', function(){
                var Hooks = new cwc.Hooks({ });

                Hooks.set_hook({
                    'hook_name' : 'foo'
                });
                expect( Hooks.all_hooks ).to.be.empty;
            });

            it('Should not add hook as method is not a function was given', function(){
                var Hooks = new cwc.Hooks({ });

                Hooks.set_hook({
                    'hook_name' : 'foo',
                    'method'    : ''
                });
                expect( Hooks.all_hooks ).to.be.empty;
            });

            it('Should pass and set client hook', function(){
                var Hooks = new cwc.Hooks({ });

                Hooks.set_hook({
                    'hook_name' : 'foo',
                    'method'    : function(){ }
                });

                expect( Hooks.all_hooks.foo.hook_name ).to.be.equal( 'foo' );
                expect( Hooks.all_hooks.foo.method    ).to.be.an( 'function' );
            });

            it('Should invoke client hook with no argument.', function(){
                var Hooks = new cwc.Hooks({ });

                Hooks.set_hook({
                    'hook_name' : 'foo',
                    'method'    : function( ){
                        console.log( arguments  );
                        expect( arguments.length ).to.be.equal( 0 );
                    }
                });

                Hooks.invoke({ 'hook_name' : 'foo', });
            });

            it('Should invoke client hook', function(){
                var Hooks = new cwc.Hooks({ });
                Hooks.set_hook({
                    'hook_name' : 'foo',
                    'method'    : function( bar ){ expect( bar ).to.be.equal( true ); }
                });
                Hooks.invoke({
                    'hook_name' : 'foo',
                    'arguments' : true
                });
            });
        });

        describe('Reserved cwc hooks' , function() {
            it('Seting reserved hook', function( ) {
                var Hooks = new cwc.Hooks({ });

                Hooks.set_hook({
                    'hook_name' : 'cwc:foo',
                    'method'    : function(){
                    }
                });

                expect( Hooks.all_reserved_hooks['cwc:foo'].hook_name ).to.be.equal( 'cwc:foo' );
                expect( Hooks.all_reserved_hooks['cwc:foo'].method    ).to.be.an( 'function' );
            });

            it('Invoking reserved hook', function( done ){
                var Hooks = new cwc.Hooks({ });

                Hooks.set_hook({
                    'hook_name' : 'cwc:foo',
                    'method'    : function( bar ){
                        expect( bar ).to.be.equal( 'bar' );
                        done();
                    }
                });

                Hooks.invoke({ 'hook_name' : 'cwc:foo', 'arguments' : 'bar' });
            });
        });
    });

    /*------------------------------------------------------
    * Chache control
    */
    describe('Chache control' , function() {
        it('Should pass as connection code has not been set.', function(){
            var ClusterCodeCache = new cwc.CacheControl({
            });
            var check = ClusterCodeCache.check_for_existence( { cluster_code : wrong_c_c } )
            expect( check ).to.be.equal( false );
        });

        it('Sould pass as default time_threshold is less than given time.', function(){
            var ClusterCodeCache = new cwc.CacheControl({
            });
            var check = ClusterCodeCache.get_time_differ( 110 )
            expect( check ).to.be.equal( true );
        });

        it('Sould pass as time_threshold is less than given time.', function(){
            var ClusterCodeCache = new cwc.CacheControl({
            });
            ClusterCodeCache.time_threshold = 90;
            var check = ClusterCodeCache.get_time_differ( 110 )
            expect( check ).to.be.equal( false );
        });

        it('Should pass and save the cluster code.', function(){
            var ClusterCodeCache = new cwc.CacheControl({
            });
            ClusterCodeCache.save_cluster_code( { key : 'test' , cluster_code : '000000' } );
            expect( ClusterCodeCache.storage_data['test']['cluster_code'] ).to.be.equal( '000000' );
        });

    });

    /*------------------------------------------------------
    * Hooks
    */
    describe('Server connection' , function() {
        describe('Internal methord' , function() {

            describe('Validateing server messages' , function() {
                it('Should fail as only espects objects', function(){
                    var Server = new cwc.Server({
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    });

                    var msg = {}

                    expect( Server.validate_message( 'msg' ) ).to.be.equal( false );
                });

                it('Should fail as no action parameters given', function(){
                    var Server = new cwc.Server({
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    });
                    var msg = { recipient : '', arguments : '' }
                    expect( Server.validate_message( msg ) ).to.be.equal( false );
                });

                it('Should fail as no recipient parameters given', function(){
                    var Server = new cwc.Server({
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    });
                    var msg = { action : '', arguments : '' }
                    expect( Server.validate_message( msg ) ).to.be.equal( false );
                });

                it('Should fail as no arguments parameters given', function(){
                    var Server = new cwc.Server({
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    });
                    var msg = { action : '', recipient : '' }
                    expect( Server.validate_message( msg ) ).to.be.equal( false );
                });
            });
        });

        describe('Public methord' , function() {
            describe('Should fail' , function() {
                it('with no cluse code given.', function(){
                    var Server = new cwc.Server({
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    });

                    Server.connect();
                    expect( Server.cluster_code ).to.be.equal( null );
                });

                it('wrong cluster code enterd.', function(){
                    var Server = new cwc.Server( {
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    } );

                    Server.connect( wrong_c_c );
                });

                it('connection-failed hook called on connection error.', function( done ){
                    var Hooks = new cwc.Hooks({ });

                    Hooks.set_hook( {
                        'hook_name' : 'connection-failed',
                        'method'    : function( feedback ){
                            expect( feedback ).to.be.an( 'object' );
                            done();
                        }
                    } );

                    var Server = new cwc.Server( {
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    } );

                    Server.connect( wrong_c_c );
                });
            });

            describe('Should pass' , function() {
                it('corrent cluster code given.', function(){
                    var Server = new cwc.Server( {
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    } );

                    Server.connect( correct_c_c );
                });

                it('connection-success hook should be called client establishes a successful connection.', function( done ){
                    var Hooks = new cwc.Hooks({ });

                    var Server = new cwc.Server({
                        host : connection_seed,
                        port : connection_port,
                        type : 'ws'
                    });

                    Hooks.set_hook({
                        'hook_name' : 'connection-success',
                        'method'    : function( feedback ){
                            expect( feedback ).to.be.an( 'object' );
                            done();
                        }
                    });

                    Server.connect( correct_c_c );
                });
            });
        });
    });

});

describe('Controller.js dependencies' , function() {
    /*------------------------------------------------------
    * Directinal Pad
    */
    describe('D-Pad controller' , function() {
        it('Find a singluer controller and add it to object.', function(){
            var DPad = new cwc.DPadController({
            });
            expect( DPad.all_controllers ).to.be.empty;
        });

        it('Save controller HTML reference.', function(){
            var DPad = new cwc.DPadController({
            });
            expect( DPad.all_controllers[0] ).to.have.property('controller');
        });

        it('Instruction should be added to object.', function(){
            var DPad = new cwc.DPadController({
            });
            expect( DPad.all_controllers[0] ).to.have.property('instructions');
        });

        it('Actions should be added to object.', function(){
            var DPad = new cwc.DPadController({
            });
            expect( DPad.all_controllers[0] ).to.have.property('actions');
        });

        it('Should call custom hook when first contrroler invoks a custom hook.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.not.equal( null );
                    done();
                }
            });

            var DPad = new cwc.DPadController({
            });
        });

        it('Should call custom hook when contrroler invoked .', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'bar',
                'method'    : function( input ){
                    expect( input ).to.not.equal( null );
                    done();
                }
            });

            var DPad = new cwc.DPadController({
            });
        });

        it('Is exspected to pass direction, compass_rose and angle as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'bar',
                'method'    : function( input ){
                    expect( input ).to.have.property('direction');
                    expect( input ).to.have.property('compass_rose');
                    expect( input ).to.have.property('angle');
                    done();
                }
            });

            var DPad = new cwc.DPadController({
            });
        });

        it('Multiple controllers should be added.', function(){
            var DPad = new cwc.DPadController({
            });
            console.log(  DPad.all_controllers )
            expect( DPad.all_controllers.length ).to.eql( 2 );
        });

        it('Should call custom hook when seconds contrroler invoks a custom hook.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'bar',
                'method'    : function( input ){
                    expect( input ).to.not.equal( null );
                    done();
                }
            });

            var DPad = new cwc.DPadController({
            });
        });

    });

    /*------------------------------------------------------
    * GesturePad controller
    */
    describe('GesturePad controller' , function() {
        it('Find a singluer controller and add it to object.', function(){
            var GesturePad = new cwc.GesturePadController({
            });
            expect( GesturePad.all_controllers ).to.be.empty;
        });

        it('Save controller HTML reference.', function(){
            var GesturePad = new cwc.GesturePadController({
            });
            expect( GesturePad.all_controllers[0] ).to.have.property('controller');
        });

        it('Save controller instructions.', function(){
            var GesturePad = new cwc.GesturePadController({
            });
            expect( GesturePad.all_controllers[0] ).to.have.property('instructions');
        });

        it('Should call custom hook when contrroler invoked .', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.not.equal( null );
                    done();
                }
            });

            var GesturePad = new cwc.GesturePadController({
            });
        });

        it('Is exspected to pass direction, compass_rose and cartesian_coordinates as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.have.property('cartesian_coordinates');
                    expect( input ).to.have.property('compass_rose');
                    expect( input ).to.have.property('direction');
                    done();
                }
            });

            var GesturePad = new cwc.GesturePadController({
            });
        });

        it('Restricted input applied, Is exspected to pass only cartesian_coordinates as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.have.property('cartesian_coordinates');
                    done();
                }
            });

            var GesturePad = new cwc.GesturePadController({
            });
        });

        it('Multiple controller should be added to the object.', function(){
            var GesturePad = new cwc.GesturePadController({
            });
            expect( GesturePad.all_controllers.length ).to.be.above(1);
        });

    });

    /*------------------------------------------------------
    * GesturePad controller
    */
    describe('Pullbar controller' , function() {
        it('Find a singluer controller and add it to object.', function(){
            var Pullbar = new cwc.PullbarController({
            });
            expect( Pullbar.all_controllers ).to.be.empty;
        });

        it('Save controllers HTML reference.', function(){
            var Pullbar = new cwc.PullbarController({
            });
            expect( Pullbar.all_controllers[0] ).to.have.property('controller');
        });

        it('Save controllers instructions.', function(){
            var Pullbar = new cwc.PullbarController({
            });
            expect( Pullbar.all_controllers[0] ).to.have.property('instructions');
        });

        it('Should call custom hook when contrroler invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    console.log( input );
                    expect( input ).to.not.equal( null );
                    done();
                }
            });

            var Pullbar = new cwc.PullbarController({
            });
        });

        it('Is exspected to pass direction, axis_direction, angle, compass_rose and cartesian_coordinates as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.have.property('cartesian_coordinates');
                    expect( input ).to.have.property('compass_rose');
                    expect( input ).to.have.property('direction');
                    done();
                }
            });

            var Pullbar = new cwc.PullbarController({
            });
        });

        it('Restricted input applied, Is exspected to pass only cartesian_coordinates as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.have.property('cartesian_coordinates');
                    done();
                }
            });

            var Pullbar = new cwc.PullbarController({
            });
        });

    });

    /*------------------------------------------------------
    * Analog Stick controller
    */
    describe('Analog Stick controller' , function() {
        it('Find a singluer controller and add it to object.', function(){
            var AnalogPad = new cwc.AnalogController({
            });
            expect( AnalogPad.all_controllers ).to.be.empty;
        });

        it('Save controllers HTML reference.', function(){
            var AnalogPad = new cwc.AnalogController({
            });
            expect( AnalogPad.all_controllers[0] ).to.have.property('controller');
        });

        it('Save controllers instructions.', function(){
            var AnalogPad = new cwc.AnalogController({
            });
            expect( AnalogPad.all_controllers[0] ).to.have.property('instructions');
        });

        it('Should call custom hook when contrroler invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    console.log( input );
                    expect( input ).to.not.equal( null );
                    done();
                }
            });

            var Analog = new cwc.AnalogController({
            });
        });

        it('Is exspected to pass direction, axis_direction, angle, compass_rose and cartesian_coordinates as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.have.property('cartesian_coordinates');
                    expect( input ).to.have.property('compass_rose');
                    expect( input ).to.have.property('direction');
                    done();
                }
            });

            var Analog = new cwc.AnalogController({
            });
        });

        it('Restricted input applied, Is exspected to pass only cartesian_coordinates as parameters to hook when invoked.', function( done ){
            this.timeout(25000);
            var Hooks = new cwc.Hooks({ });

            Hooks.set_hook({
                'hook_name' : 'foo',
                'method'    : function( input ){
                    expect( input ).to.have.property('cartesian_coordinates');
                    done();
                }
            });

            var Analog = new cwc.AnalogController({
            });
        });

    });
});