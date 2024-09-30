const SpecialRequestOption = require("../models/specialRequestOption");

exports.createSpecialRequest = async (req, res) => {
    try {
        const { requestTitle, eligibleYearLevels } = req.body;

        const getColorCode = async () => {
            while (true) {
                let colorCode = Math.floor(Math.random() * 16777215).toString(16);
                let existingColorCode = await SpecialRequestOption.findOne({colorCode: colorCode});
                if (!existingColorCode) {
                    colorCode = "#" + colorCode;
                    return colorCode;
                }
            }
        }

        const specialRequest = await SpecialRequestOption.create({
          requestTitle,
          eligibleYearLevels,
          colorCode: await getColorCode(),
        });

        return res.status(200).json({
            specialRequest
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getSpecialRequests = async (req, res) => {
    try {
        const specialRequests = await SpecialRequestOption.find();

        return res.status(200).json({
            specialRequests
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.updateSpecialRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { requestTitle, eligibleYearLevels } = req.body;

        const updatedSpecialRequest =
          await SpecialRequestOption.findByIdAndUpdate(
            {
              _id: id,
            },
            {
              requestTitle,
              eligibleYearLevels,
            },
            { new: true }
          );

        return res.status(200).json({
            updatedSpecialRequest
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteSpecialRequest = async (req, res) => {
    try {
        const { id } = req.params;

        await SpecialRequestOption.findByIdAndDelete({
          _id: id,
        });

        return res.status(200).json({
            message: "Special Request deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}