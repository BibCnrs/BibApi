import { bibadmin_host, mailServer } from 'config';

const getHref = id => `${bibadmin_host}/#/janusAccounts/edit/${id}`;

const getLink = ({ uid, id }) => `<a href="${getHref(id)}">${uid}</a>`;

const getSimilarAlertMailHtml = (account, similarAccounts) =>
    `<p>Le nouveau compte ${getLink(
        account,
    )} ressemble aux comptes suivants : </p>
<ul>
    ${similarAccounts.map(account => `<li>${getLink(account)}</li>`).join(`\n`)}
</ul>`;

const getSimilarAlertMailText = (account, similarAccounts) =>
    `Le nouveau compte ${account.uid} : ${getHref(
        account.id,
    )} ressemble aux comptes suivants :
${similarAccounts
        .map(({ uid, id }) => `- ${uid} : ${getHref(id)}`)
        .join('\n')}`;

export default (account, similarAccounts) =>
    account
        ? {
              from: mailServer.from,
              to: mailServer.to,
              subject: `Alerte : Nouveau uid ${account.uid} similaire`,
              text: getSimilarAlertMailText(account, similarAccounts),
              html: getSimilarAlertMailHtml(account, similarAccounts),
          }
        : null;
