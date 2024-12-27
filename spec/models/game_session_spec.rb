require 'rails_helper'

RSpec.describe GameSession, type: :model do
  subject { 
    described_class.new(session_code: "ABC123", active: true)
  }

  it "is valid with valid attributes" do
    expect(subject).to be_valid
  end

  it "is not valid without a session_code" do
    subject.session_code = nil
    expect(subject).to_not be_valid
  end

  it "is not valid with a non-unique session_code" do
    described_class.create!(session_code: "ABC123", active: true)
    expect(subject).to_not be_valid
  end

  it "is not valid without an active status" do
    subject.active = nil
    expect(subject).to_not be_valid
  end

  it "has many players" do
    assoc = described_class.reflect_on_association(:players)
    expect(assoc.macro).to eq :has_many
  end
end
