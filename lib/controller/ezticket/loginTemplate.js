export const translation = {
    fr: {
        login: 'identifiant',
        password: 'mot de passe',
        title: 'Identifiez-vous',
        info: "La ressource ou le service souhaité est réservé aux ayants droit du CNRS. Pour y accéder il est nécessaire de s'identifier.",
        chooseMode: 'Veuillez sélectionner votre mode de connexion :',
        connection: 'Connexion',
        janus: 'se connecter avec janus',
        labintelAccount: "Via le gestionnaire d'identité janus",
        inistAccount: "Via le code d'accès de votre unité",
        contact: 'nous contacter',
        askAccount: 'demander un compte janus',
        janusExplanation:
            "Compte personnel pour l'ensemble des services du CNRS : Agate, Simbad...",
        401: `L'identifiant/mot de passe saisi n'a pas permis de vous connecter au portail, veuillez essayer à nouveau en majuscule sans espace.
Si le problème persiste, n'hésitez pas à contacter assistance-portail@inist.fr`,
    },
    en: {
        login: 'login',
        password: 'password',
        title: 'Identifiy yourself',
        info: 'This resource or service is reserved for CNRS rights holders. Please sign in.',
        chooseMode: 'Please select your signing-in mode:',
        connection: 'Connection',
        janus: 'connect with janus',
        labintelAccount: 'Via Janus identity manager',
        inistAccount: 'Via your unit access code',
        contact: 'contact us',
        askAccount: 'request a janus account',
        janusExplanation:
            'personal account for all CNRS services Agate, Simbad ...',
        401: `The username / password is wrong. Please try again (in capital letters without spaces).
If the problem persists, do not hesitate to contact assistance-portail@inist.fr`,
    },
};

export default (language, error) => {
    const text = translation[language];

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <style>
.tooltip {
    left: 33%;
    right: 33%;
    display: none;
}
.btn, input, .modal-content, .panel {
    border-radius: 0!important;
}
.btn-primary {
    color: #fff;
    background-color: #337ab7;
    border-color: #2e6da4;
}
.panel-title {
    cursor: pointer;
}
.panel-title:hover{
    text-decoration: underline;
}
.logo {
    width: 50px;
    position: absolute;
    right: 10px;
    top: 0px;
}
.choose {
    font-weight: bold;
}
.ask-account {
    float: right;
}
    </style>
</head>
<body>
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">${
                text.title
            }<img class="logo" src="./bibcnrs.png"/></div>
            <div class="modal-body">
                ${
                    error
                        ? `<div class="alert alert-danger" role="alert">
                        <p>${text[error]}</p>
                    </div>`
                        : ''
                }
                <p><small>${text.info}</small></p>
                <p class="choose">${text.chooseMode}</p>
                <button id="janus_connect" type="button" class="janus btn btn-primary btn-block">
                    <span class="fa fa-sign-in"></span> <span class="text">
                        ${text.labintelAccount}
                    </span>
                </button>
                <div id="tooltip" class="tooltip bottom" role="tooltip">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner">${text.janusExplanation}</div>
                </div>
                <p class="ask-account">
                    <a href="https://sesame.cnrs.fr" target="blank">${
                        text.askAccount
                    }</a>
                </p>
                <button id="bibapi_toggle" type="button" class="inist btn btn-primary btn-block">
                    <span class="fa fa-sign-in"></span> <span class="text">
                        ${text.inistAccount}
                    </span>
                </button>
                <div class="bibapi panel panel-primary">
                    <div id="bibapi-panel" class="panel-collapse collapse" >
                        <div class="panel-body">
                            <form  class="form-signin" role="form" method="post">
                                <div id="error"></div>
                                <div class="form-group">
                                    <label class="control-label" for="username">${
                                        text.login
                                    }</label>
                                    <input id="username" class="form-control" name="username" type="text" required="true">
                                </div>
                                <div class="form-group">
                                    <label class="control-label" for="password">${
                                        text.password
                                    }</label>
                                    <input id="password" class="form-control" name="password" type="password" required="true">
                                </div>
                                <div class="form-group">
                                    <button type="submit" class="btn btn-primary btn-block">${
                                        text.connection
                                    }</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <a href="mailto:assistance-portail@inist.fr">${text.contact}</a>
            </div>
        </div>
    </div>
    <script type="text/javascript">
        (function () {
            document.getElementById("janus_connect").onclick = function() {
                document.location.href =(
                    window.location.href.replace(new RegExp('/ezticket/login.*'), '') +
                    '/ebsco/login_renater/?origin=' +
                    encodeURIComponent(window.location.href.replace('/login', ''))
                );
            };

            var tooltip = document.getElementById("tooltip");
            var janusButton = document.getElementById("janus_connect");
            janusButton.addEventListener('mouseenter', function ()  {
                tooltip.style.opacity = 1;
                tooltip.style.display = 'block';
            });
            janusButton.addEventListener('mouseleave', function ()  {
                tooltip.style.opacity = 0;
                tooltip.style.display = 'none';
            });

            var bibapiButton = document.getElementById("bibapi_toggle");
            var panel = document.getElementById("bibapi-panel");
            bibapiButton.onclick = function() {
                panel.classList.toggle('in');
            };
        })()
    </script>
</body>
</html>`;
};
