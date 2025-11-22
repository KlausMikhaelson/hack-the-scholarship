import prisma from '../config/database.js';

export const getExamples = async (req, res, next) => {
  try {
    const examples = await prisma.example.findMany();
    res.json(examples);
  } catch (error) {
    next(error);
  }
};

export const getExampleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const example = await prisma.example.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }
    
    res.json(example);
  } catch (error) {
    next(error);
  }
};

export const createExample = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const example = await prisma.example.create({
      data: {
        name,
        description
      }
    });
    res.status(201).json(example);
  } catch (error) {
    next(error);
  }
};

export const updateExample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const example = await prisma.example.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description
      }
    });
    
    res.json(example);
  } catch (error) {
    next(error);
  }
};

export const deleteExample = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.example.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

