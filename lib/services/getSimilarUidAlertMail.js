import { bibadmin_host, mailServer } from 'config';

const getEditHref = (id) => `${bibadmin_host}/#/janusAccounts/${id}`;
const getListHref = (uid) => {
    const [, root] = uid.match(/^(.*?)\.[0-9]+$/) || [null, uid];
    return `${bibadmin_host}/#/janusAccounts?filter={"uid"%3A"${root}"}`;
};

const getLink = ({ uid, id }) => `<a href="${getEditHref(id)}">${uid}</a>`;

const getSimilarAlertMailHtml = (account, similarAccounts) =>
    `<p>Le nouveau compte ${getLink(
        account,
    )} ressemble aux comptes suivants : </p>
<a href="${getListHref(account.uid)}">Liste :</a>
<ul>
    ${similarAccounts
        .map((account) => `<li>${getLink(account)}</li>`)
        .join(`\n`)}
</ul>`;

const getSimilarAlertMailText = (account, similarAccounts) =>
    `Le nouveau compte ${account.uid} : ${getEditHref(
        account.id,
    )} ressemble aux comptes suivants :
Liste ${getListHref(account.uid)} :
${similarAccounts
    .map(({ uid, id }) => `- ${uid} : ${getEditHref(id)}`)
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
