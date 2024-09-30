const MOA = require("../models/moa");
const MOATypes = require("../models/moaTypes");

exports.createMOA = async (req, res) => {
  try {
    const { type, companyName, dateSigned, expiryDate, uploadedBy, file } =
      req.body;
    const types = await MOATypes.find();

    const typeExist = types.find((t) => t.name === type);

    if (!typeExist) {
      await MOATypes.create({
        name: type,
      });
    }

    const moa = await MOA.create({
      type,
      companyName,
      dateSigned,
      expiryDate,
      file,
      uploadedBy,
      uploadedDate: Date.now(),
    });

    return res.status(201).json({
      moa,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMOA = async (req, res) => {
  try {
    const moa = await MOA.find();

    return res.status(200).json({
      moa,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateMOA = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, companyName, dateSigned, expiryDate, file } = req.body;

    const types = await MOATypes.find();

    const typeExist = types.find((t) => t.name === type);

    if (!typeExist) {
      await MOATypes.create({
        name: type,
      });
    }

    const moa = await MOA.updateOne(
      { _id: id },
      {
        type,
        companyName,
        dateSigned,
        expiryDate,
        file,
      }
    );

    return res.status(200).json({
      moa,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteMOA = async (req, res) => {
  try {
    const { id } = req.params;

    const moa = await MOA.deleteOne({ _id: id });

    return res.status(200).json({
      moa,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMOATypes = async (req, res) => {
  try {
    const moaTypes = await MOATypes.find();

    return res.status(200).json({
      moaTypes,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createMOATypes = async (req, res) => {
  try {
    const { name } = req.body;

    const moaTypes = await MOATypes.create({
      name,
    });

    return res.status(201).json({
      moaTypes,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateMOATypes = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const moaTypes = await MOATypes.updateOne(
      { _id: id },
      {
        name,
      }
    );

    return res.status(200).json({
      moaTypes,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteMOATypes = async (req, res) => {
  try {
    const { id } = req.params;

    const moaTypes = await MOATypes.deleteOne({ _id: id });

    return res.status(200).json({
      moaTypes,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
