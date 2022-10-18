import getSimilarUidAlertMail from '../../../lib/services/getSimilarUidAlertMail';

describe('getSimilarUidAlertMail', () => {
    it('should generate mail', () => {
        assert.deepEqual(
            getSimilarUidAlertMail({ uid: 'firstname.name.3', id: 3 }, [
                { uid: 'firstname.name.2', id: 2 },
                { uid: 'firstname.name.1', id: 1 },
            ]),
            {
                from: 'bibcnrs@bib.cnrs.fr',
                to: 'assistance-portail@inist.fr',
                subject: `Alerte : Nouveau uid firstname.name.3 similaire`,
                text: `Le nouveau compte firstname.name.3 : https://bibadmin_url/#/janusAccounts/3 ressemble aux comptes suivants :
Liste https://bibadmin_url/#/janusAccounts?filter={"uid"%3A"firstname.name"} :
- firstname.name.2 : https://bibadmin_url/#/janusAccounts/2
- firstname.name.1 : https://bibadmin_url/#/janusAccounts/1`,
                html: `<p>Le nouveau compte <a href="https://bibadmin_url/#/janusAccounts/3">firstname.name.3</a> ressemble aux comptes suivants : </p>
<a href="https://bibadmin_url/#/janusAccounts?filter={"uid"%3A"firstname.name"}">Liste :</a>
<ul>
    <li><a href="https://bibadmin_url/#/janusAccounts/2">firstname.name.2</a></li>
<li><a href="https://bibadmin_url/#/janusAccounts/1">firstname.name.1</a></li>
</ul>`,
            },
        );
    });

    it('should generate mail', () => {
        assert.deepEqual(getSimilarUidAlertMail(), null);
    });
});
