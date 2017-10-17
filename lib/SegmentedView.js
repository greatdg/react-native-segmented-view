'use strict';
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {
  StyleSheet, Animated, findNodeHandle,
  View, Text, Image, TouchableHighlight,
} from 'react-native';

//  SegmentedView-----------------------------container----------------------------------------.
//  |                                                                                          |
//  | .-----------------------------------titles-container-----------------------------------. |
//  | |                                                                                      | |
//  | |--item--:------item------:--item--:------item------:--item--:------item------:--item--| |
//  | |                                                                                      | |
//  | |        .---title-view---.        .---title-view---.        .---title-view---.        | |
//  | |        | .------------. |        | .------------. |        | .------------. |        | |
//  | | spacer | | title-text | | spacer | | title-text | | spacer | | title-text | | spacer | |
//  | |        ' '------------' |        ' '------------' |        ' '------------' |        | |
//  | |        '----------------'        '----------------'        '----------------'        | |
//  | '--------------------------------------------------------------------------------------' |
//  | .---------------------------------indicator-background---------------------------------. |
//  | |        .----indicator---.                                                            | |
//  | |        '----------------'                                                            | |
//  | '--------------------------------------------------------------------------------------' |
//  '------------------------------------------------------------------------------------------'


class SegmentedView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      indicator: {
        left: new Animated.Value(0),
        width: new Animated.Value(0),
      },
    };
    this._renderItems = this._renderItems.bind(this);
    this._renderSpacerItem = this._renderSpacerItem.bind(this);
    this._renderTitleItem = this._renderTitleItem.bind(this);
    this._renderTitle = this._renderTitle.bind(this);
    this._renderIndicator = this._renderIndicator.bind(this);
    this._moveTo = this._moveTo.bind(this);
    this._measureTitleItem = this._measureTitleItem.bind(this);
  }

  componentDidMount() {
    setTimeout(() => this._moveTo(this.props.index, false), 0);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.index != this.props.index) {
      this._moveTo(nextProps.index, true);
    }
  }

  render() {
    const indicator = {...objects.indicator, ...this.props.indicator};

    return (
      <View {...this.props} style={[styles.container, this.props.style]}>
        {indicator.position === 'top' && this._renderIndicator(indicator)}
        <View ref='titlesContainer' style={styles.titlesContainer}>
          {this._renderItems()}
        </View>
        {indicator.position === 'bottom' && this._renderIndicator(indicator)}
      </View>
    );
  }

  _renderItems() {
    const {titles, stretch} = this.props;
    let items = [];
    for (let i = 0; i < titles.length; i++) {
      if (!stretch) {
        items.push(this._renderSpacerItem(i));
      }
      items.push(this._renderTitleItem(titles[i], i));
    }
    if (!stretch) {
      items.push(this._renderSpacerItem('-'));
    }
    return items;
  }

  _renderSpacerItem(i) {
    return <View key={'s' + i} style={styles.spacer}/>;
  }

  _renderTitleItem(title, i) {
    const {index, stretch, onPress, underlayColor, renderTitle} = this.props;
    const itemStyle = {flex: stretch ? 1 : 0};
    const active = (index === i);

    return (
      <TouchableHighlight key={i} ref={i} style={itemStyle}
        underlayColor={underlayColor} onPress={() => onPress(i, title, active)}>
        {renderTitle ? renderTitle(i, title, active) : this._renderTitle(i, title, active)}
      </TouchableHighlight>
    );
  }

  _renderTitle(i, title, active) {
    const {titleStyles} = this.props;

    const viewStyle = [styles.titleView].concat(
      active ? styles.activeTitleView : undefined,
      titleStyles.view,
      active ? titleStyles.activeView : undefined,
    );
    const textStyle = [styles.titleText].concat(
      active ? styles.activeTitleText : undefined,
      titleStyles.text,
      active ? titleStyles.activeText : undefined,
    );

    return (
      <View style={viewStyle}>
        <Text style={textStyle}>
          {title}
        </Text>
      </View>
    );
  }

  _renderIndicator(indicator) {
    const style = [styles.indicator, {
      left: this.state.indicator.left,
      width: this.state.indicator.width,
      backgroundColor: indicator.color,
      height: indicator.height,
    }];
    const backgroundStyle = [styles.indicatorBackground, {
      backgroundColor: indicator.backgroundColor,
      height: indicator.height,
    }];

    return (
      <View style={backgroundStyle}>
        <Animated.View style={style}/>
      </View>
    );
  }

  _moveTo(index, animated = true) {
    function onMeasure(x, y, w, h) {
      if (animated) {
        const animation = {...objects.animation, ...this.props.animation};

        Animated.parallel([
          Animated.timing(this.state.indicator.left, {
            toValue: x,
            duration: animation.duration,
          }),
          Animated.timing(this.state.indicator.width, {
            toValue: w,
            duration: animation.duration,
          }),
        ]).start(animation.onEnd);

        animation.onStart();
      } else {
        this.state.indicator.left.setValue(x);
        this.state.indicator.width.setValue(w);
      }
    }

    this._measureTitleItem(index, onMeasure.bind(this));
  }

  _measureTitleItem(index, onSuccess) {
    const title = this.refs[index];
    const container = this.refs.titlesContainer;
    title.measureLayout(findNodeHandle(container), onSuccess);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titlesContainer: {
    flexDirection: 'row',
  },
  titleView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  activeTitleView: {
    // ...titleView
  },
  titleText: {
    color: 'lightgray',
    fontSize: 13,
  },
  activeTitleText: {
    // ...titleText
    color: 'black',
  },
  spacer: {
    flex: 1,
  },
  indicatorBackground: {
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
  },
});

const objects = {
  indicator: {
    color: 'black',
    backgroundColor: 'lightgray',
    height: 3,
    position: 'bottom',
  },
  animation: {
    duration: 200,
    onStart: ()=>{},
    onEnd: ()=>{},
  },
};

SegmentedView.propTypes = {
  titles: PropTypes.arrayOf(PropTypes.string).isRequired,
  index: PropTypes.number,

  onPress: PropTypes.func, // (index:number, title:string, active:bool)
  underlayColor: PropTypes.string,
  stretch: PropTypes.bool, // should title stretch to fill its area? if true there would has no spacer between titles.

  renderTitle: PropTypes.func, // (index:number, title:string, active:bool)
  titleStyles: PropTypes.shape({
    view: View.style,
    text: Text.style,
    activeView: View.style,
    activeText: Text.style,
  }),

  indicator: PropTypes.shape({
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    height: PropTypes.number,
    position: PropTypes.oneOf(['top', 'bottom']),
  }),

  animation: PropTypes.shape({
    duration: PropTypes.number,
    onStart: PropTypes.func,
    onEnd: PropTypes.func,
  }),
};

SegmentedView.defaultProps = {
  index: 0,
  onPress: ()=>{},
  underlayColor: 'transparent',
  stretch: false,
  titleStyles: {},
};


export default SegmentedView;
