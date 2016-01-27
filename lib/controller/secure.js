import RenaterHeader from '../models/RenaterHeader';

export const secure = function* secure() {
    const renaterHeader = new RenaterHeader(this.request.header);
    yield renaterHeader.save();

    this.body = 'Merci de vous être loggé';
};
