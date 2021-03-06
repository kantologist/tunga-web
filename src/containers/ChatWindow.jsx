import React from 'react';
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';

import ChannelView from '../components/Channel';
import ChatBox from '../components/ChatBox';

import connect from '../utils/connectors/ChannelConnector';
import {CHANNEL_TYPES} from '../constants/Api';
import {
    isAuthenticated,
    isAdmin,
    isDeveloper,
    isProjectOwner,
    getUser,
} from '../utils/auth';

export function resizeOverviewBox() {
    var w_h = $(window).height();
    var nav_h = $('nav.navbar').height();
    var wf_h = $('.chat-head').height();
    var t_h = nav_h + wf_h + 120;

    if (w_h > t_h) {
        let chatbox_h = w_h - t_h,
            extra_h = 0;
        if (chatbox_h > 500) {
            extra_h = chatbox_h - 500;
            chatbox_h = 500;
        }
        //let topBaseline = ($(window).width() >= 768)?100:100;
        $('.chat-overview').css('height', `${chatbox_h}px`);
        $('#chat-window').css('top', `${100 + extra_h}px`);
    }
}

class ChatWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {channel: null, new: 0, open: false};
    }

    componentWillMount() {
        this.intervals = [];

        var channel = null;
        var open = false;
        if (this.props.channelId) {
            channel = {id: this.props.channelId};
            open = true;
        } else if (!isAuthenticated() && typeof Storage !== 'undefined') {
            try {
                channel = JSON.parse(window.localStorage.channel);
            } catch (e) {
                channel = null;
            }
        }

        if (!isAuthenticated()) {
            const {autoOpen, Channel, ChannelActions} = this.props;
            if (autoOpen && !Channel.hasAutoOpenedChat) {
                let cw = this;
                setTimeout(function() {
                    cw.setState({open: true});
                    ChannelActions.recordAutoOpenChatSuccess();
                }, __PRODUCTION__ ? 10000 : 30 * 60 * 1000);
            }
        }
        this.setState({channel, open});
    }

    componentDidMount() {
        resizeOverviewBox();
        $(window).resize(resizeOverviewBox);

        this.setInterval(this.getNewMessages.bind(this), 10000);

        const {ChannelActions} = this.props;

        if (isAuthenticated()) {
            ChannelActions.createSupportChannel();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.Channel.detail.channel.id) {
            var currentChannel = this.getCurrentChannel();
            const {channel} = nextProps.Channel.detail;

            if (
                nextProps.Channel.detail.channel.type ==
                    CHANNEL_TYPES.support &&
                (nextProps.Channel.detail.isSaved !=
                    this.props.Channel.detail.isSaved ||
                    (currentChannel &&
                        nextProps.Channel.detail.channel.id ==
                            currentChannel.id))
            ) {
                this.setState({channel});
                this.saveChannel(channel);
            }
        }

        if (nextProps.Channel.detail.support.new != this.state.new) {
            this.setState({new: nextProps.Channel.detail.support.new});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        resizeOverviewBox();
        if (
            !isAuthenticated() &&
            this.state.open &&
            !prevState.open &&
            !this.state.channel
        ) {
            const {ChannelActions} = this.props;
            ChannelActions.createSupportChannel();
        }

        if (this.props.closeChat && !prevProps.closeChat && this.state.open) {
            this.setState({open: false});
        }

        if (this.state.open && !prevState.open && this.audio) {
            this.audio.play();
        }
    }

    componentWillUnmount() {
        this.saveChannel(this.getCurrentChannel());
        this.intervals.map(clearInterval);
    }

    setInterval() {
        this.intervals.push(setInterval.apply(null, arguments));
    }

    getCurrentChannel() {
        return typeof this.state.channel === 'object'
            ? this.state.channel
            : null;
    }

    saveChannel(channel) {
        if (
            !isAuthenticated() &&
            typeof Storage !== 'undefined' &&
            channel &&
            !channel.created_by
        ) {
            try {
                window.localStorage.channel = JSON.stringify(channel);
            } catch (e) {
                window.localStorage.channel = null;
            }
        }
    }

    startChannel() {
        const {ChannelActions} = this.props;
        if (isAuthenticated() && !this.state.channel) {
            ChannelActions.createSupportChannel();
        }
        this.setState({open: true});
    }

    minimizeWindow() {
        this.setState({open: false});
    }

    closeWindow() {
        this.setState({open: false});
    }

    getNewMessages() {
        const {ChannelActions} = this.props;
        const channel = this.state.channel;
        if (!this.state.open && channel) {
            var since = channel.last_read || 0;
            ChannelActions.listChannelActivity(channel.id, {since}, false);
        }
    }

    render() {
        const {Channel, Message, ChannelActions, MessageActions} = this.props;
        const {channel} = this.state;
        let tooltip = <Tooltip id="tooltip">Chat with us!</Tooltip>;

        return (
            <div id="chat-widget">
                {this.state.open ? (
                    <div id="chat-window">
                        <div className="chat-overview overview">
                            <div className="mainbox">
                                <button
                                    className="btn chat-btn chat-top-btn"
                                    onClick={this.closeWindow.bind(this)}>
                                    <i className="fa fa-times fa-lg" />
                                </button>
                                {channel && channel.id ? (
                                    <ChannelView
                                        channelId={channel.id}
                                        channelView="messages"
                                        Channel={Channel}
                                        Message={Message}
                                        ChannelActions={ChannelActions}
                                        MessageActions={MessageActions}>
                                        <ChatBox />
                                    </ChannelView>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div>
                    {this.state.open ? (
                        <button
                            className="btn chat-btn"
                            onClick={this.closeWindow.bind(this)}>
                            <i className="fa fa-times fa-lg" />
                        </button>
                    ) : (
                        <OverlayTrigger placement="top" overlay={tooltip}>
                            <button
                                id="support-chat"
                                className="btn chat-btn"
                                onClick={this.startChannel.bind(this)}>
                                <i className="fa fa-comments fa-lg" />
                                {this.state.new ? (
                                    <span className="badge">
                                        {this.state.new}
                                    </span>
                                ) : null}
                            </button>
                        </OverlayTrigger>
                    )}
                </div>
                <audio
                    autoPlay={false}
                    controls={false}
                    ref={audio => {
                        this.audio = audio;
                    }}>
                    <source
                        src={require('../audio/chat.mp3')}
                        type="audio/mpeg"
                    />
                    <source
                        src={require('../audio/chat.wav')}
                        type="audio/wav"
                    />
                </audio>
            </div>
        );
    }
}

ChatWindow.propTypes = {
    channelId: React.PropTypes.number,
    closeChat: React.PropTypes.bool,
    autoOpen: React.PropTypes.bool,
};

ChatWindow.defaultProps = {
    channelId: null,
    closeChat: false,
    autoOpen: true,
};

export default connect(ChatWindow);
