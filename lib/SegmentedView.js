var React = require('react');

var {
    PropTypes
} = React;

var {
    StyleSheet,
    Text,
    Image,
    View,
    TouchableHighlight,
    findNodeHandle,
    Dimensions
} = require('react-native');

var screen = Dimensions.get('window');
var tweenState = require('react-tween-state');

var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
    },
    title: {
        //flex: 0,
        //backgroundColor: '#f3f3f3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        flex: 1,
    },
    barContainer: {
        position: 'relative',
    },
    bar: {
        backgroundColor: 'blue',
        position: 'absolute',
    }
});


var SegmentedView = React.createClass({

    mixins: [tweenState.Mixin],

    propTypes: {
        duration: PropTypes.number,
        onTransitionStart: PropTypes.func,
        onTransitionEnd: PropTypes.func,
        onPress: PropTypes.func,
        renderTitle: PropTypes.func,
        titles: PropTypes.array,
        index: PropTypes.number,
        barColor: PropTypes.string,
        barPathColor: PropTypes.string,
        barHeight: PropTypes.number,
        barPosition: PropTypes.string,
        underlayColor: PropTypes.string,
        stretch: PropTypes.bool,
        selectedTitleStyle: PropTypes.object,
        titleStyle: PropTypes.object,
        titlePaddingHorizontal: PropTypes.number,
        titlePaddingVertical: PropTypes.number,
    },

    getDefaultProps() {
        return {
            duration: 200,
            onTransitionStart: ()=>{},
            onTransitionEnd: ()=>{},
            onPress: ()=>{},
            renderTitle: null,
            index: 0,
            barColor: '#44B7E1',
            barPathColor: 'lightgray',
            barHeight: 3,
            barPosition:'top',
            underlayColor: '#CCCCCC',
            stretch: false,
            selectedTitleStyle: null,
            titleStyle: null,
            titlePaddingHorizontal: 2,
            titlePaddingVertical: 8,
        };
    },

    getInitialState() {
        return {
            barLeft: 0,
            barRight: screen.width,
        };
    },

    componentDidMount() {
        setTimeout(() => this.moveTo(this.props.index), 0);
    },

    componentWillReceiveProps(nextProps) {
        this.moveTo(nextProps.index);
    },

    measureHandler(ox, oy, width) {

        this.tweenState('barLeft', {
            easing: tweenState.easingTypes.easeInOutQuad,
            duration: 200,
            endValue: ox
        });

        this.tweenState('barRight', {
            easing: tweenState.easingTypes.easeInOutQuad,
            duration: 200,
            endValue: screen.width - ox - width,
            onEnd: this.props.onTransitionEnd
        });

        setTimeout(this.props.onTransitionStart, 0);
    },

    moveTo(index) {
        const container = this.refs.titleContainer;
        this.refs[index].measureLayout(findNodeHandle(container), this.measureHandler);
    },

    _renderTitle(title, i) {
        return (
            <View style={[styles.title, {
              paddingHorizontal: this.props.titlePaddingHorizontal,
              paddingVertical: this.props.titlePaddingVertical}]}>
                <Text style={[this.props.titleStyle, i === this.props.index && this.props.selectedTitleStyle]}>{title}</Text>
            </View>
        );
    },

    renderTitle(title, i) {
        return (
            <View key={i} ref={i} style={{ flex: this.props.stretch ? 1 : 0 }}>
                <TouchableHighlight underlayColor={this.props.underlayColor} onPress={() => this.props.onPress(i)}>
                    {this.props.renderTitle ? this.props.renderTitle(title, i) : this._renderTitle(title, i)}
                </TouchableHighlight>
            </View>
        );
    },

    render() {
        var items = [];
        var titles = this.props.titles;

        if (!this.props.stretch) {
            items.push(<View key={`s`} style={styles.spacer} />);
        }

        for (var i = 0; i < titles.length; i++) {
            items.push(this.renderTitle(titles[i], i));
            if (!this.props.stretch) {
                items.push(<View key={`s${i}`} style={styles.spacer} />);
            }
        }
        var barContainer = (
          <View style={[styles.barContainer, {
            backgroundColor:this.props.barPathColor,
            height:this.props.barHeight}]}>
              <View ref="bar" style={[styles.bar, {
                  left: this.getTweeningValue('barLeft'),
                  right: this.getTweeningValue('barRight'),
                  backgroundColor: this.props.barColor,
                  height: this.props.barHeight}]}
              />
          </View>
        );
        return (
            <View {...this.props} style={[styles.container, this.props.style]}>
                {this.props.barPosition == 'top' && barContainer}
                <View ref='titleContainer' style={styles.titleContainer}>
                    {items}
                </View>
                {this.props.barPosition == 'bottom' && barContainer}
            </View>
        );
    }
});

module.exports = SegmentedView;
