import { Router, Response, NextFunction } from 'express';
import FoodDonation from '../models/FoodDonation';
import User from '../models/User';
import PickupAssignment from '../models/PickupAssignment';
import { ApiError } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/impact
// @desc    Get impact metrics
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type = 'personal' } = req.query;

    if (type === 'personal') {
      const user = await User.findById(req.user?._id)
        .select('completedDonations trustBadge')
        .lean();

      let impactData;

      if (req.user?.role === 'donor') {
        const donations = await FoodDonation.find({
          donor: req.user._id,
          status: { $in: ['completed', 'delivered'] },
        }).lean();

        const totalQuantity = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);

        impactData = {
          totalDonations: donations.length,
          totalQuantity,
          mealsProvided: Math.round(totalQuantity * 2),
          co2Saved: Math.round(totalQuantity * 2.5),
          waterSaved: Math.round(totalQuantity * 1000),
          trustBadge: user?.trustBadge || 'none',
          badges: calculateDonorBadges(donations.length, totalQuantity),
        };
      } else if (req.user?.role === 'ngo') {
        const claimed = await FoodDonation.find({
          claimedBy: req.user._id,
          status: { $in: ['completed', 'delivered'] },
        }).lean();

        const totalQuantity = claimed.reduce((sum, d) => sum + (d.quantity || 0), 0);

        impactData = {
          foodReceived: claimed.length,
          totalQuantity,
          peopleServed: Math.round(totalQuantity * 2),
          trustBadge: user?.trustBadge || 'none',
          badges: calculateNGOBadges(claimed.length),
        };
      } else if (req.user?.role === 'volunteer') {
        const completedPickups = user?.completedDonations || 0;

        impactData = {
          completedPickups,
          distanceTraveled: completedPickups * 5,
          hoursVolunteered: completedPickups * 0.75,
          trustBadge: user?.trustBadge || 'none',
          badges: calculateVolunteerBadges(completedPickups),
        };
      }

      return res.json({
        success: true,
        data: impactData,
      });
    }

    if (type === 'leaderboard') {
      const { category = 'donors' } = req.query;

      let leaderboard;

      if (category === 'donors') {
        leaderboard = await FoodDonation.aggregate([
          { $match: { status: { $in: ['completed', 'delivered'] } } },
          {
            $group: {
              _id: '$donor',
              donationCount: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
            },
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $project: {
              name: '$user.name',
              organization: '$user.organization',
              trustBadge: '$user.trustBadge',
              donationCount: 1,
              totalQuantity: 1,
              impactScore: { $add: ['$donationCount', { $multiply: ['$totalQuantity', 0.1] }] },
            },
          },
        ]);
      } else if (category === 'ngos') {
        leaderboard = await FoodDonation.aggregate([
          { $match: { status: { $in: ['completed', 'delivered'] }, claimedBy: { $exists: true } } },
          {
            $group: {
              _id: '$claimedBy',
              claimsCount: { $sum: 1 },
              totalReceived: { $sum: '$quantity' },
            },
          },
          { $sort: { totalReceived: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $project: {
              name: '$user.organization',
              trustBadge: '$user.trustBadge',
              claimsCount: 1,
              totalReceived: 1,
              peopleServed: { $multiply: ['$totalReceived', 2] },
            },
          },
        ]);
      } else if (category === 'volunteers') {
        leaderboard = await User.find({
          role: 'volunteer',
          completedDonations: { $gt: 0 },
        })
          .select('name completedDonations trustBadge')
          .sort({ completedDonations: -1 })
          .limit(20)
          .lean();
      }

      return res.json({
        success: true,
        data: leaderboard,
        category,
      });
    }

    if (type === 'platform') {
      const [
        totalDonations,
        totalQuantity,
        totalDonors,
        totalNGOs,
        totalVolunteers,
      ] = await Promise.all([
        FoodDonation.countDocuments({ status: { $in: ['completed', 'delivered'] } }),
        FoodDonation.aggregate([
          { $match: { status: { $in: ['completed', 'delivered'] } } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]),
        User.countDocuments({ role: 'donor', isActive: true }),
        User.countDocuments({ role: 'ngo', isActive: true }),
        User.countDocuments({ role: 'volunteer', isActive: true }),
      ]);

      const quantity = totalQuantity[0]?.total || 0;

      return res.json({
        success: true,
        data: {
          totalDonations,
          totalQuantity: quantity,
          mealsProvided: Math.round(quantity * 2),
          co2Saved: Math.round(quantity * 2.5),
          waterSaved: Math.round(quantity * 1000),
          activeDonors: totalDonors,
          activeNGOs: totalNGOs,
          activeVolunteers: totalVolunteers,
        },
      });
    }

    throw new ApiError(400, 'Invalid type parameter');
  } catch (error) {
    next(error);
  }
});

// Helper functions
function calculateDonorBadges(donationCount: number, quantity: number): string[] {
  const badges: string[] = [];

  if (donationCount >= 1) badges.push('First Donation');
  if (donationCount >= 5) badges.push('Regular Donor');
  if (donationCount >= 10) badges.push('Dedicated Donor');
  if (donationCount >= 25) badges.push('Champion Donor');
  if (donationCount >= 50) badges.push('Hero Donor');
  if (donationCount >= 100) badges.push('Legend');

  if (quantity >= 100) badges.push('100kg Saved');
  if (quantity >= 500) badges.push('500kg Saved');
  if (quantity >= 1000) badges.push('1 Ton Saved');

  return badges;
}

function calculateNGOBadges(claimsCount: number): string[] {
  const badges: string[] = [];

  if (claimsCount >= 1) badges.push('First Claim');
  if (claimsCount >= 10) badges.push('Active Recipient');
  if (claimsCount >= 50) badges.push('Community Partner');
  if (claimsCount >= 100) badges.push('Impact Leader');

  return badges;
}

function calculateVolunteerBadges(pickups: number): string[] {
  const badges: string[] = [];

  if (pickups >= 1) badges.push('First Delivery');
  if (pickups >= 5) badges.push('Helping Hand');
  if (pickups >= 15) badges.push('Road Warrior');
  if (pickups >= 30) badges.push('Delivery Hero');
  if (pickups >= 50) badges.push('Community Champion');
  if (pickups >= 100) badges.push('Volunteer Legend');

  return badges;
}

export default router;
