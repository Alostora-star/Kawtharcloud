const express = require('express');
const { pool } = require('../db');
const { auth } = require('./auth');
const router = express.Router();

// Get students
router.get('/', auth, async (req, res) => {
  try {
    let query = `
      SELECT s.*, g.name as group_name, u.name as parent_name, u.email as parent_email
      FROM students s
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN users u ON s.parent_id = u.id
    `;
    const params = [];
    if (req.user.role === 'teacher') {
      query += ` WHERE g.teacher_id = $1`;
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ` WHERE s.parent_id = $1`;
      params.push(req.user.id);
    }
    query += ' ORDER BY s.name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student with full info
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, g.name as group_name, u.name as parent_name
      FROM students s
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE s.id = $1
    `, [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create student (admin)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح' });
  const { name, group_id, parent_id, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO students (name, group_id, parent_id, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, group_id, parent_id || null, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student (admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح' });
  const { name, group_id, parent_id, notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE students SET name=$1, group_id=$2, parent_id=$3, notes=$4 WHERE id=$5 RETURNING *',
      [name, group_id, parent_id || null, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student (admin)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'غير مصرح' });
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
