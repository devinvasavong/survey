console.log('main.js loaded');

const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
    document.getElementsByClassName('live-text')[0].innerHTML = 'Connected to live server';
    document.getElementsByClassName('live-text')[0].style.color = 'rgba(76, 173, 92, 1)';
});

socket.on("starter", (data) => {
    console.log(data)
    switch(data[0]) {
        case "clear":
            document.getElementsByClassName('question-container')[0].style.display = 'none';
            document.getElementsByClassName('response-container')[0].style.display = 'none';
            document.getElementsByClassName('notification-list')[0].innerHTML = '';
            break;
        case "participants":
            document.getElementsByClassName('participants')[0].innerHTML = data[1] + ' <span style="font-size: 12px; color: rgba(0, 0, 0, .25)">participant' + (data[1] == 1 ? '' : 's') + '</span>';
            break;
        case "question":
            let question = data[1];
            console.log("Question", question);
            
            document.getElementsByClassName('question-container')[0].style.display = 'block';
            document.getElementsByClassName('response-container')[0].style.display = 'none';
            document.getElementsByClassName('question')[0].innerHTML = question.question;
            document.getElementsByClassName('response-container')[0].innerHTML = '';
            for(let i = 0; i < question.options.length; i++) {
                let response = question.options[i];
                let responseElement = document.createElement('div');
                responseElement.classList.add('response');
                responseElement.innerHTML = `
                    <input type="radio" name="response" id="response-${i}" value="${response}">
                    <label for="response-${i}"">${response}</label>
                `;
                document.getElementsByClassName('response-container')[0].appendChild(responseElement);
            }

            // cant see responses?
            document.getElementsByClassName('response-container')[0].style.display = 'grid';

            break;
    }
})

socket.on('notif', (message, time) => {
    let notification = document.createElement('li');
    notification.classList.add('notification-item');
    notification.innerHTML = `
        <div class="notification-item-inner">
            <p class="notification-item-text">${message}</p>
        </div>
    `;
    document.getElementsByClassName('notification-list')[0].appendChild(notification);
    if(time) {
        setTimeout(() => {
            notification.style.opacity = 0;
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, time);
    }
})

function submit() {
    const selected = document.querySelector('input[name="response"]:checked')
    if(selected) {
        const value = selected.value;
        console.log("Submitting value: " + value);
        socket.emit('submit', value);
        document.getElementsByClassName('question-container')[0].style.display = 'none';
    } else {
        console.log("No color selected");
    }
}