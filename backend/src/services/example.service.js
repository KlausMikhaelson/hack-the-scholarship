import prisma from '../config/database.js';

export const exampleService = {
  async findAll() {
    return await prisma.example.findMany();
  },

  async findById(id) {
    return await prisma.example.findUnique({
      where: { id: parseInt(id) }
    });
  },

  async create(data) {
    return await prisma.example.create({
      data
    });
  },

  async update(id, data) {
    return await prisma.example.update({
      where: { id: parseInt(id) },
      data
    });
  },

  async delete(id) {
    return await prisma.example.delete({
      where: { id: parseInt(id) }
    });
  }
};

