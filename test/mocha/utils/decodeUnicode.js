'use strict';

import decodeUnicode from '../../../lib/utils/decodeUnicode';

const text = `L&#39;atteinte art&#233;rielle des membres au cours de la maladie
de Horton (MH) est rarement rapport&#233;e. Elle est probablement
sous-estim&#233;e en raison de son caract&#232;re souvent asymptomatique.`;

const decodedText = `L\'atteinte artérielle des membres au cours de la maladie
de Horton (MH) est rarement rapportée. Elle est probablement
sous-estimée en raison de son caractère souvent asymptomatique.`;

describe('decodeUnicode', function () {
    it ('should decode all encoded character', function () {
        assert.equal(decodeUnicode(text), decodedText);
    });

    it ('should return null if passed null', function () {
        assert.equal(decodeUnicode(null), null);
    });
});
