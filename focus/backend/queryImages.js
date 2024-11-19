const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/images', { useNewUrlParser: true, useUnifiedTopology: true });

const imageSchema = new mongoose.Schema({
    image: String,
});

const Image = mongoose.model('Image', imageSchema);

const queryImages = async () => {
    try {
        const images = await Image.find();
        console.log(images);
    } catch (error) {
        console.error('Error querying images:', error);
    } finally {
        mongoose.connection.close();
    }
};

queryImages();