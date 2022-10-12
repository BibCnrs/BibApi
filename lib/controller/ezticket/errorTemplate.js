import config from 'config';

const urlImage = `${config.api_endpoint}/bibcnrspng`;

export const translation = {
    fr: {
        unauthorized: () =>
            'Vous ne pouvez accéder à cette ressource car vous interrogez un domaine autre que votre domaine autorisé. Veuillez relancer votre requête en sélectionnant votre domaine.',
        noGate: () => 'ezProxy non spécifié. Votre lien est invalide',
        invalidGate: (gate) =>
            `L'ezproxy ${gate} n'existe pas. Votre lien est invalide.`,
    },
    en: {
        unauthorized: () =>
            'You cannot access this resource because you are searching in a discipline which is not within your authorized discipline field. Please run another search request after selecting your discipline field.',
        noGate: () => 'No ezproxy, your link is invalid',
        invalidGate: (gate) =>
            `The ${gate} ezproxy does not exist. Your link is invalid.`,
    },
};

export default (language, error, gate) => {
    const text = translation[language];

    return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Login</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
            <style>
            .container-fluid {
                margin-top: 1rem;
            }
            .logo {
                float: left;
                width: 50px;
                margin-right: 10px;
            }
            </style>
        </head>
        <body>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="alert alert-danger" role="alert">
                            <img class="logo" src="${urlImage}"/>
                            <p>${text[error](gate)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>`;
};
