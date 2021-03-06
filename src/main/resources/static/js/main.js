function getIndex(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return i;
        }
    }

    return -1;
}

var messageApi = Vue.resource('/message{/id}');

Vue.component(
    "message-form", {
        props: ['messages', 'messageAttr'],
        watch: {
            messageAttr: function (newVal, oldVal) {
                this.text = newVal.text;
                this.id = newVal.id;
            }
        },
        data: function () {
            return {
                text: '',
                id: ''
            }
        },
        template: "<div>  " +
        "<input type='text' placeholder='Write something' v-model='text'>" +
        "<input type='button' value='Save' @click='save'>" +
        "</div>",
        methods: {
            save: function () {
                var message = {text: this.text};
                if (this.id) {
                    messageApi.update({id: this.id}, message).then(result =>
                        result.json().then(data => {
                            var index = getIndex(this.messages, data.id);
                            this.messages.splice(index, 1, data);
                            this.text = '';
                            this.id = ''
                        })
                    )
                } else {
                    messageApi.save({}, message).then(result =>
                        result.json().then(data => {
                            this.messages.push(data);
                            this.text = ''
                        })
                    )
                }
            }
        }
    }
);
Vue.component(
    "messages-row", {
        props: ['message', 'editMethod', 'messages'],
        template: '<div>' +
        '<i>({{message.id}})</i>{{message.text}}' +
        '<span id="s1">' +
        '<input type="button" value="Edit" @click="edit" />' +
        '<input type="button" value="Delete" @click="del" />' +
        '</span>' +
        '</div>',
        methods: {
            edit: function () {
                this.editMethod(this.message);
            },
            del: function () {
                messageApi.remove({id: this.message.id}).then(result => {
                    if (result.ok) {
                        this.messages.splice(this.messages.indexOf(this.message), 1)
                    }
                })
            }
        }
    }
);
Vue.component(
    "messages-list", {
        props: ['messages'],
        data: function () {
            return {
                message: null
            }
        },
        template: '<div id="d1">' +
        '<message-form :messages="messages"  :messageAttr="message" />' +
        '<messages-row id="d2" v-for="message in messages" :editMethod="editMethod"' +
        ' :message="message" :messages="messages" :key="message.id" />' +
        '</div>',
        methods: {
            editMethod: function (message) {
                this.message = message;
            }
        }
    }
);

var app = new Vue({
    el: "#app",
    template:
    '<div>' +
    '<div v-if="!profile">Необходимо авторизоваться через <a href="/login">Google</a></div>' +
    '<div v-else>' +
    '<div>{{profile.name}}&nbsp;<a href="/logout">Выйти</a></div>' +
    '<messages-list :messages="messages" />' +
    '</div>' +
    '</div>'
    ,
    data: {
        messages: frontendData.messages,
        profile: frontendData.profile
    },
    created: function () {
        // messageApi.get().then(result =>
        //     result.json().then(data =>
        //         data.forEach(message => this.messages.push(message))
        //     )
        // )
    }
});