// Contextual dialogue engine for Alice, Bob, Chuck, and Jim Bob

const DIALOGUE_LIBRARY = {
  alice: {
    betting: [
      'Sticking to standard unit bet.',
      'Controlled stakes, clean math.',
      'Basic strategy requires steady bankroll discipline.',
      'Unit wager placed. Ready for the deal.'
    ],
    deal_blackjack: [
      'Natural twenty-one. 3 to 2 payout confirmed.',
      'Blackjack. Textbook start to the round.'
    ],
    deal_strong: [
      'Twenty. A solid position against any dealer card.',
      'Nineteen. I will hold this position comfortably.'
    ],
    deal_stiff: [
      'Sixteen. A classic stiff hand; we must adhere to the chart.',
      'Twelve against dealer upcard. Applying basic strategy.'
    ],
    deal_generic: [
      'Two cards received. Evaluating next action.',
      'Cards on the felt. Checking the strategy matrix.'
    ],
    action_hit: [
      'Hitting according to basic strategy.',
      'Card please. Mathematical expectation favors a draw.',
      'Hit. Probability supports drawing here.'
    ],
    action_stand: [
      'Standing. Basic strategy fulfilled.',
      'I will stand on this total.',
      'Stand. Maximizes expected value against dealer upcard.'
    ],
    action_double: [
      'Doubling down on positive expectation.',
      'Basic strategy indicates a double here.',
      'Doubling the wager. High probability of a favorable outcome.'
    ],
    action_split: [
      'Splitting pairs. Splitting provides superior expected return.',
      'Split. Converting one hand into two independent positions.'
    ],
    round_win: [
      'Expected outcome achieved.',
      'Clean round. The math holds over time.',
      'Winning hand settled according to probabilities.'
    ],
    round_blackjack_win: [
      'Natural blackjack paid at 3 to 2.',
      'Optimal payout collected.'
    ],
    round_bust: [
      'Bust. Acceptable variance in the long run.',
      'Hand exceeded twenty-one. A calculated risk.'
    ],
    round_push: [
      'Push. Capital preserved.',
      'Tie with the dealer. Bets returned.'
    ],
    round_loss: [
      'Loss recorded. Continuing within strategy parameters.',
      'Dealer takes the round. Sticking to the process.'
    ],
    react_human_blackjack: [
      'Excellent hand, player. 3 to 2 payout collected.',
      'Proper timing for a natural twenty-one.'
    ],
    react_human_bust: [
      'Tough break. Always check the basic strategy table for that total.',
      'Variance is unavoidable on stiff hands.'
    ],
    react_human_double: [
      'A textbook double down opportunity.',
      'Sound statistical move, player.'
    ]
  },
  bob: {
    betting: [
      'Time to let it ride! Sizing up!',
      'Dealer, prepare your chip tray!',
      'Go big or go home, that is my motto!',
      'Feeling lucky this shoe. Let us see some action!'
    ],
    deal_blackjack: [
      'BOOM! Blackjack baby! Pay me my money!',
      'Twenty-one right out of the gate! Woohoo!'
    ],
    deal_strong: [
      'Twenty! Dealer, you are in big trouble now!',
      'Looking dangerous at nineteen. Let us go!'
    ],
    deal_stiff: [
      'Sixteen? No fear at this table!',
      'Ugliest hand in the deck, but I have a good feeling!'
    ],
    deal_generic: [
      'Cards are dealt, let us see the fireworks!',
      'I smell a big payout coming this round!'
    ],
    action_hit: [
      'Give me another one! Do not be shy!',
      'Hit me! Bring on the paint!',
      'Hit! I came to gamble, not spectate!'
    ],
    action_stand: [
      'Good right here. Let us see what the house has got!',
      'Standing! Beat that total, dealer!',
      'Sitting pretty on this one.'
    ],
    action_double: [
      'Double down! Double the bet, double the glory!',
      'Stack those chips! One big face card coming right up!',
      'Doubling down! Fortune favors the bold!'
    ],
    action_split: [
      'Split them up! Twice the action, twice the fun!',
      'Two hands are better than one! Deal me in on both!'
    ],
    round_win: [
      'That is what I am talking about! Cash me out!',
      'Winner winner! House cannot stop this streak!',
      'Chips coming my way! Who is having more fun than us?'
    ],
    round_blackjack_win: [
      'Natural twenty-one! Best feeling in the casino!',
      'Three to two payout in the bank!'
    ],
    round_bust: [
      'Too greedy! Ah well, the next shoe will be mine!',
      'Busted! Dealer, you got lucky that time!',
      'Flew too close to the sun! Next hand is mine!'
    ],
    round_push: [
      'A tie? Come on dealer, give me the win!',
      'Push! We will settle this on the next deal.'
    ],
    round_loss: [
      'Dealer took that one, but I am coming right back!',
      'Just a temporary setback. Chips are going back in!'
    ],
    react_human_blackjack: [
      'Now that is what I like to see! Way to smack the dealer!',
      'Huge hand, player! Keep that momentum rolling!'
    ],
    react_human_bust: [
      'Hey, at least you went down swinging like a champion!',
      'Bust happens! Shake it off and press the next bet!'
    ],
    react_human_double: [
      'Love the aggression! Let us get that ten-card!',
      'Double it up! That is how you play blackjack!'
    ]
  },
  chuck: {
    betting: [
      'Count is climbing. Sizing up my wager.',
      'Deck is neutral. Maintaining base unit.',
      'Shoe running cold. Keeping the bet tight at minimum.',
      'Card distribution warrants this bet size.'
    ],
    deal_blackjack: [
      'Blackjack. High card concentration is doing its job.',
      'Natural twenty-one. The math works.'
    ],
    deal_strong: [
      'Twenty. Strong standing position.',
      'Nineteen. Ready to hold.'
    ],
    deal_stiff: [
      'Stiff total. Checking count index before acting.',
      'Stiff hand, but the count guides this decision.'
    ],
    deal_generic: [
      'Cards received. Tracking running count.',
      'Hand logged. Awaiting my turn to act.'
    ],
    action_hit: [
      'Hit. Probability favors drawing a safe card here.',
      'Taking a card. Expected value remains positive.',
      'Hit. Count composition supports a draw.'
    ],
    action_stand: [
      'Standing. Dealer bust frequency is elevated.',
      'Stand. Protecting the wager.',
      'Stand. Optimal play according to current deck composition.'
    ],
    action_double: [
      'Doubling. High card density maximizes conversion.',
      'Double down. Probability tilts heavily toward ten-values.',
      'Doubling the stake on positive expected return.'
    ],
    action_split: [
      'Splitting pairs. Statistically favorable against this upcard.',
      'Split. Multiplying advantage across two hands.'
    ],
    round_win: [
      'Calculated profit realized.',
      'The count delivered as projected.',
      'Favorable shoe cycle yielded a win.'
    ],
    round_blackjack_win: [
      'Blackjack payout collected. Count advantage confirmed.',
      'High-count shoe bearing fruit.'
    ],
    round_bust: [
      'Busted. High card density carried residual bust risk.',
      'Variance occurred, but the process was mathematically sound.'
    ],
    round_push: [
      'Push. Preserved capital for positive shoe counts.',
      'Pushed hand. Shoe remains in play.'
    ],
    round_loss: [
      'Negative round. Bankroll intact for the next shoe cycle.',
      'Short term loss. The edge will manifest over volume.'
    ],
    react_human_blackjack: [
      'High cards flowing. Good timing on your wager, player.',
      'Natural twenty-one. Advantage shoe at work.'
    ],
    react_human_bust: [
      'High card density makes stiff hits volatile right now.',
      'Unfortunate draw, but variance is part of the count.'
    ],
    react_human_double: [
      'Smart double. The remaining deck composition favors you.',
      'Statistically disciplined move.'
    ],
    count_insight_positive: [
      'Notice the count: with low cards depleted, dealer bust odds are higher.',
      'True count is positive. Player advantage is active.'
    ],
    count_insight_negative: [
      'Count is negative. Aces and tens are depleted; dealer draws small cards safely.',
      'Negative count shoe. Defensive play is prudent.'
    ]
  },
  jimbob: {
    betting: [
      'Ten bucks is plenty for me! Slow and steady.',
      'Just watching and learning, folks. Table minimum please.',
      'Fingers crossed on this ten dollar bill!',
      'Hope my beginner luck holds up!'
    ],
    deal_blackjack: [
      'Wait, is this twenty-one?! Did I win already?!',
      'Look at that! An Ace and a face card! Yippee!'
    ],
    deal_strong: [
      'Twenty! Even I know that is pretty good!',
      'Nineteen! I am definitely not touching these cards!'
    ],
    deal_stiff: [
      'Oh dear, sixteen. Everyone says sixteen is trouble...',
      'Fourteen. My knees are shaking a little bit.'
    ],
    deal_generic: [
      'Whew, okay, don\'t panic... what is my total again?',
      'Two shiny cards for Jim Bob. Let us see what happens!'
    ],
    action_hit: [
      'Gotta hit this one, right? Hit me, dealer!',
      'Card please, nice and easy, nothing too big!',
      'Hit me! Please do not let me bust!'
    ],
    action_stand: [
      'I am staying right here! Don\'t wanna bust!',
      'Sticking with this, fingers crossed!',
      'Standing pat. Good luck to the rest of the table!'
    ],
    action_double: [
      'Wait, can I really double the bet? Okay, let us do it!',
      'Doubling down! Gulp... hope this card is good!'
    ],
    action_split: [
      'Splitting? Two hands at once? Wish me luck!',
      'Two hands to manage! Hope I do not mess this up!'
    ],
    round_win: [
      'I won! Hey look at that, I actually won!',
      'Woohoo! Beginner luck strikes again!',
      'Chips for Jim Bob! This game is great!'
    ],
    round_blackjack_win: [
      'Blackjack win! Drinks on me, or at least a soda!',
      'Twenty-one victory! What a hand!'
    ],
    round_bust: [
      'Aw shucks, busted again! Why did I ask for that card?!',
      'Over twenty-one! I should have stayed put!',
      'Bust! There go my hard-earned chips.'
    ],
    round_push: [
      'At least I didn\'t lose my chips! A tie works for me.',
      'Push! Whew, thought I was a goner there.'
    ],
    round_loss: [
      'Darn it, the dealer got me. Learning experience!',
      'Lost that one, but I am still having fun!'
    ],
    react_human_blackjack: [
      'Whoa, great job! Hope some of that luck rubs off on me!',
      'Blackjack! You make this look so easy!'
    ],
    react_human_bust: [
      'Been there, friend! It hurts every time.',
      'Ouch, tough bust. The dealer is ruthless today!'
    ],
    react_human_double: [
      'So brave! I get nervous just watching that double down!',
      'Double down! You have nerves of steel!'
    ]
  }
};

const recentHistory = {
  alice: '',
  bob: '',
  chuck: '',
  jimbob: ''
};

/**
 * Select a dialogue line for a character matching the event
 */
export const getCharacterDialogue = (characterId, eventType, context = {}) => {
  const charPool = DIALOGUE_LIBRARY[characterId];
  if (!charPool) return null;

  let candidates = charPool[eventType];
  if (!candidates || candidates.length === 0) {
    if (eventType.startsWith('deal_')) {
      candidates = charPool.deal_generic;
    } else if (eventType.startsWith('round_')) {
      candidates = charPool.round_win;
    }
  }

  if (!candidates || candidates.length === 0) return null;

  // Filter out the immediately preceding quote to prevent direct repeats
  const lastLine = recentHistory[characterId];
  const freshCandidates = candidates.filter((line) => line !== lastLine);
  const selectedPool = freshCandidates.length > 0 ? freshCandidates : candidates;

  const chosen = selectedPool[Math.floor(Math.random() * selectedPool.length)];
  recentHistory[characterId] = chosen;
  return chosen;
};

export const clearDialogueHistory = () => {
  recentHistory.alice = '';
  recentHistory.bob = '';
  recentHistory.chuck = '';
  recentHistory.jimbob = '';
};
