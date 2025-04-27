const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: mongoose.Schema.Types.String, ref: 'User', required: true },
    university: { type: String, required: true },
    year: { type: String, required: true },
    solde: { type: Number, default: 0, required: true },
    sessionCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
