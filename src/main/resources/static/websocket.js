var stompClient = null;
$(function () {
    new Vue({
        el: "#websocket",
        data: {
            messages: [],
            fields: ['scrappTime', 'title', 'damaged', 'addedTime', 'url'],
            newLink: "",
            delay: "60",
            spinner: true
        },
        methods: {
            connect: function () {
                const socket = new SockJS('/connect');
                stompClient = Stomp.over(socket);
                const that = this;
                stompClient.connect({}, function (frame) {

                    // that.handleMessageReceipt("Connected");
                    stompClient.subscribe('/topic/messages',
                        function (messageOutput) {
                            console.log("Checking message");
                            if (that.isJson(messageOutput.body)) {
                                that.spinner = false;
                                that.handleMessageReceipt(JSON.parse(messageOutput.body))
                            }
                            console.log("Wrong message type: " + messageOutput.body)
                            that.spinner = true;
                        });
                    if (stompClient != null) {
                        stompClient.send("/ws/startDefault");
                    } else {
                        alert("Please connect first");
                    }
                });
            },
            connectWithCustomDelay: function () {
                if (stompClient != null) {
                    stompClient.send("/ws/start", {}, this.delay);
                } else {
                    alert("Please connect first");
                }

            },
            disconnect: function () {
                if (stompClient != null) {
                    stompClient.disconnect();
                }
                // this.handleMessageReceipt("Disconnected");
                if (stompClient != null) {
                    stompClient.send("/ws/stop");
                } else {
                    alert("Please connect first");
                }
            },

            handleMessageReceipt: function (messageOutput) {
                messageOutput.forEach((value, index) => {
                    let time = new Date().toLocaleString().replace(',', '');
                    let scrappTime = {scrappTime: time};
                    this.messages.push(Object.assign(scrappTime, value));
                    console.log(value + index);
                });
            },

            isJson: function (item) {
                item = typeof item !== "string" ? JSON.stringify(item) : item;
                try {
                    item = JSON.parse(item);
                } catch (e) {
                    return false;
                }
                return typeof item === "object" && item !== null;
            },

            addLinkToScrapp: function () {
                if (stompClient != null) {
                    stompClient.send("/ws/addLink", {}, this.newLink);
                    this.newLink = '';
                } else {
                    alert("Please connect first");
                }
            }
        },
        beforeMount() {
            this.connect();
        }
    });
});