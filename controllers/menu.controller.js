import Menu from '../models/menu.model.js'

export const addDish = async (req, res) => {
  const cafeId = req.params.cafeId
  const {
    dishName,
    dishDescription,
    dishPrice,
    dishCategory,
    dishType,
    variants,
    addons,
  } = req.body

  if (
    !dishName ||
    !dishDescription ||
    !dishPrice ||
    !dishCategory ||
    !dishType
  ) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    const newMenu = new Menu({
      cafeId,
      dishName,
      dishDescription,
      dishPrice,
      dishCategory,
      dishType,
      dishVariants: variants,
      dishAddOns: addons,
    })

    await newMenu.save()
    res.status(201).json({ message: 'Dish added successfully' })
  } catch (error) {
    console.error('Error saving new menu:', error)
    return res.status(400).json({ message: error.message })
  }
}

export const getMenu = async (req, res, next) => {
  const { cafeId } = req.params
  try {
    const dishes = await Menu.find({ cafeId })

    // Return 200 with an empty array if no dishes are found
    return res.status(200).json({ dishes })
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return res.status(500).json({ message: 'Error fetching dishes', error })
  }
}

export const deleteDish = async (req, res) => {
  const { cafeId } = req.params
  const { dishname, dishCategory } = req.body

  try {
    const deletedDish = await Menu.findOneAndDelete({
      cafeId,
      dishName: { $regex: new RegExp(`^${dishname}$`, 'i') },
      dishCategory: { $regex: new RegExp(`^${dishCategory}$`, 'i') },
    })

    if (!deletedDish) {
      return res.status(404).json({ message: 'Dish not found' })
    }

    res.status(200).json({ message: 'Dish deleted successfully', deletedDish })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getDishStatus = async (req, res) => {
  const { cafeId, dishName, dishCategory } = req.params

  try {
    const dish = await Menu.findOne({
      cafeId,
      dishName: { $regex: new RegExp(dishName.trim(), 'i') },
      dishCategory: { $regex: new RegExp(dishCategory.trim(), 'i') },
    })

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' })
    }

    return res.status(200).json({ dishStatus: dish.dishStatus })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateDishStatus = async (req, res) => {
  const { cafeId } = req.params
  const { dishName, dishCategory, dishStatus } = req.body

  try {
    const dish = await Menu.findOne({ cafeId, dishName, dishCategory })

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' })
    }

    dish.dishStatus = dishStatus
    await dish.save()
    res
      .status(200)
      .json({ message: 'Updated the availability of the dish', dish })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateDish = async (req, res) => {
  const { cafeId } = req.params
  const { originalDishName, dishCategory, updatedDish } = req.body

  if (!originalDishName || !dishCategory || !updatedDish) {
    return res
      .status(400)
      .json({ message: 'Missing required fields for dish update' })
  }

  try {
    const existingDish = await Menu.findOne({
      cafeId,
      dishName: { $regex: new RegExp(`^${originalDishName}$`, 'i') },
      dishCategory: { $regex: new RegExp(`^${dishCategory}$`, 'i') },
    })

    if (!existingDish) {
      return res
        .status(404)
        .json({ message: 'Dish not found in the specified category' })
    }

    existingDish.dishName = updatedDish.dishName
    existingDish.dishDescription = updatedDish.dishDescription
    existingDish.dishPrice = updatedDish.dishPrice
    existingDish.dishType = updatedDish.dishType

    if (updatedDish.variants && updatedDish.variants.length > 0) {
      existingDish.dishVariants = updatedDish.variants
    } else {
      existingDish.dishVariants = []
    }

    if (updatedDish.addons && updatedDish.addons.length > 0) {
      existingDish.dishAddOns = updatedDish.addons
    } else {
      existingDish.dishAddOns = []
    }

    await existingDish.save()

    return res.status(200).json({
      message: 'Dish updated successfully',
      dish: existingDish,
    })
  } catch (error) {
    console.error('Error updating dish:', error)
    res.status(500).json({ message: error.message })
  }
}

export const getDishType = async (req, res) => {
  const { cafeId, dishName } = req.params

  try {
    const dish = await Menu.findOne({
      cafeId,
      dishName: { $regex: new RegExp(`^${dishName}$`, 'i') },
    }).select('dishType')

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' })
    }

    return res.status(200).json({ dishType: dish.dishType })
  } catch (error) {
    console.error('Error fetching dish type:', error)
    return res.status(500).json({ message: 'Error fetching dish type', error })
  }
}

export const getDishDetails = async (req, res) => {
  const { cafeId, dishName, dishCategory } = req.params

  try {
    const dish = await Menu.findOne({
      cafeId,
      dishName: { $regex: new RegExp(`^${dishName}$`, 'i') },
      dishCategory: { $regex: new RegExp(`^${dishCategory}$`, 'i') },
    })

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' })
    }

    return res.status(200).json({
      dish: {
        dishName: dish.dishName,
        dishDescription: dish.dishDescription,
        dishPrice: dish.dishPrice,
        dishType: dish.dishType,
        dishVariants: dish.dishVariants || [],
        dishAddOns: dish.dishAddOns || [],
      },
    })
  } catch (error) {
    console.error('Error fetching dish details:', error)
    return res
      .status(500)
      .json({ message: 'Error fetching dish details', error })
  }
}
