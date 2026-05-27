const express = require('express');
const { pool } = require('../db');
const { auth } = require('./auth');
const router = express.Router();

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    let query = `
      SELECT g.*, u.name as teacher_name, COUNT(s.id) as student_count
      FROM groups g
      LEFT JOIN users u ON g.teacher_id = u.id
      LEFT JOIN students s ON s.group_id = g.id
    `;
    const params = [];
    if (req.user.role === 'teacher') {
      query += ' WHERE g.teacher_id = $1';
      params.push(req.user.id);
    }
    query += ' GROUP BY g.id, u.name ORDER BY g.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create group (admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح' });
  const { name, teacher_id, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO groups (name, teacher_id, description) VALUES ($1, $2, $3) RETURNING *',
      [name, teacher_id, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update group (admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح' });
  const { name, teacher_id, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE groups SET name=$1, teacher_id=$2, description=$3 WHERE id=$4 RETURNING *',
      [name, teacher_id, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete group (admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح' });
  try {
    await pool.query('DELETE FROM groups WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
