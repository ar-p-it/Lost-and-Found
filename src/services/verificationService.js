// src/services/verificationService.js

exports.calculateTrustScore = (claimData, postData) => {
  let score = 0;
  const logs = [];

  // 1. Image Proof (+30 Points)
  if (claimData.imageProofUrl) {
    score += 30;
    logs.push("Image proof provided (+30)");
  } else {
    logs.push("No image proof provided (0)");
  }

  // 2. Serial Number Match (+50 Points)
  if (claimData.serialNumber && postData.description) {
    // Basic check: is the serial number mentioned in the finder's description?
    if (postData.description.includes(claimData.serialNumber)) {
      score += 50;
      logs.push("Serial number matched description (+50)");
    }
  }

  // 3. Keyword Matching (+20 Points max)
  if (claimData.additionalDescription && postData.description) {
    const claimantWords = claimData.additionalDescription.toLowerCase().split(/\s+/);
    const finderWords = postData.description.toLowerCase();
    
    let matches = 0;
    const ignoreWords = ['the', 'and', 'is', 'it', 'with', 'item', 'lost', 'found', 'a', 'an'];

    claimantWords.forEach(word => {
      if (word.length > 3 && !ignoreWords.includes(word) && finderWords.includes(word)) {
        matches++;
      }
    });

    const textScore = Math.min(matches * 5, 20);
    score += textScore;
    logs.push(`Description keyword match: ${matches} words found (+${textScore})`);
  }

  return { 
    score: Math.min(score, 100), 
    breakdown: logs 
  };
};