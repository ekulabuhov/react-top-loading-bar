import React from "react";
import "./LoadingBar.css";

const UPDATE_TIME = 200;
const MAX_PROGRESS = 99;
const PROGRESS_INCREASE = 10;
const ANIMATION_TIME = UPDATE_TIME * 4;
const TERMINATING_ANIMATION_TIME = UPDATE_TIME / 2;

const initialState = {
  terminatingAnimationTimeout: null,
  percent: 0,
  progressInterval: null
};

export default class LoadingBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, initialState, { hasMounted: false });

    this.boundSimulateProgress = this.simulateProgress.bind(this);
    this.boundResetProgress = this.resetProgress.bind(this);
  }

  componentDidMount() {
    // Re-render the component after mount to fix problems with SSR and CSP.
    //
    // Apps that use Server Side Rendering and has Content Security Policy
    // for style that doesn't allow inline styles should render an empty div
    // and replace it with the actual Loading Bar after mount
    // See: https://github.com/mironov/react-redux-loading-bar/issues/39
    //
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ hasMounted: true });

    if (this.props.loading > 0) {
      this.launch();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.shouldStart(nextProps)) {
      this.launch();
    } else if (this.shouldStop(nextProps)) {
      if (this.state.percent === 0 && !this.props.showFastActions) {
        // not even shown yet because the action finished quickly after start
        clearInterval(this.state.progressInterval);
        this.resetProgress();
      } else {
        // should progress to 100 percent
        this.setState({ percent: 100 });
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.progressInterval);
    clearTimeout(this.state.terminatingAnimationTimeout);
  }

  shouldStart(nextProps) {
    return this.props.loading === 0 && nextProps.loading > 0;
  }

  shouldStop(nextProps) {
    return this.state.progressInterval && nextProps.loading === 0;
  }

  shouldShow() {
    return this.state.percent > 0 && this.state.percent <= 100;
  }

  launch() {
    let { progressInterval, percent } = this.state;
    const { terminatingAnimationTimeout } = this.state;

    const loadingBarNotShown = !progressInterval;
    const terminatingAnimationGoing = percent === 100;

    if (loadingBarNotShown) {
      progressInterval = setInterval(
        this.boundSimulateProgress,
        this.props.updateTime
      );
    }

    if (terminatingAnimationGoing) {
      clearTimeout(terminatingAnimationTimeout);
    }

    percent = 0;

    this.setState({ progressInterval, percent });
  }

  newPercent() {
    const { percent } = this.state;
    const { progressIncrease } = this.props;

    // Use cos as a smoothing function
    // Can be any function to slow down progress near the 100%
    const smoothedProgressIncrease =
      progressIncrease * Math.cos(percent * (Math.PI / 2 / 100));

    return percent + smoothedProgressIncrease;
  }

  simulateProgress() {
    let { progressInterval, percent, terminatingAnimationTimeout } = this.state;
    const { maxProgress } = this.props;

    if (percent === 100) {
      clearInterval(progressInterval);
      terminatingAnimationTimeout = setTimeout(
        this.boundResetProgress,
        TERMINATING_ANIMATION_TIME
      );
      progressInterval = null;

      this.setState({
        progressInterval,
        terminatingAnimationTimeout
      });
    } else if (this.newPercent() <= maxProgress) {
      const newPercent = this.newPercent();
      if (percent !== newPercent) {
        this.setState({
          percent: newPercent
        });
      }
    }
  }

  resetProgress() {
    this.setState(initialState);
  }

  getAnimationTime() {
    return this.state.percent !== 100
      ? ANIMATION_TIME
      : TERMINATING_ANIMATION_TIME;
  }

  getOpacity() {
    return this.shouldShow() ? "1" : "0";
  }

  getBaseStyle() {
    const style = {
      opacity: "1",
      position: "fixed",
      zIndex: 9999
    };
    style.opacity = this.getOpacity();
    return style;
  }

  getLineStyle() {
    const style = {
      backgroundColor: "black",
      transition: `width ${this.getAnimationTime()}ms linear`,
      height: "2px",
      width: `${this.state.percent}%`,
      willChange: "width, opacity",
      transformOrigin: "left",
      top: 0
    };
    style.opacity = this.getOpacity();
    return Object.assign({}, style, this.getBaseStyle());
  }

  getSpinnerStyle() {
    const style = {
      willChange: "opacity",
      top: 2,
      left: 5
    };
    style.opacity = this.getOpacity();
    return Object.assign({}, style, this.getBaseStyle());
  }

  render() {
    // In order not to violate strict style CSP it's better to make
    // an extra re-render after component mount
    if (!this.state.hasMounted) {
      return <div />;
    }

    return (
      <div>
        <div style={this.getLineStyle()} className={this.props.className} />
        <div style={this.getSpinnerStyle()} className={this.props.className}>
          <div className="LoadingBar-spinner" />
        </div>
      </div>
    );
  }
}

LoadingBar.defaultProps = {
  className: undefined,
  loading: 0,
  maxProgress: MAX_PROGRESS,
  progressIncrease: PROGRESS_INCREASE,
  showFastActions: false,
  style: {},
  updateTime: UPDATE_TIME
};
